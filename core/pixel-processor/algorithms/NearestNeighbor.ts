// core/pixel-processor/algorithms/NearestNeighbor.ts
import { IPixelAlgorithm } from '@shared/interfaces';
import { PixelSettings, ColorPalette } from '@shared/types/pixelart';
import { colorDistance } from '@shared/utils/color';

export class NearestNeighbor implements IPixelAlgorithm {
    name = 'nearest-neighbor' as const;

    apply(input: ImageData, settings: PixelSettings): ImageData {
        // 1. Redimensionner l'image
        const resized = this.resizeImage(input, settings.targetSize.width, settings.targetSize.height);

        // 2. Appliquer la palette de couleurs si spécifiée
        let result = resized;
        if (settings.colorPalette) {
            result = this.applyColorPalette(resized, settings.colorPalette);
        }

        // 3. Appliquer le dithering si activé
        if (settings.dithering && settings.colorPalette) {
            result = this.applyDithering(result, settings.colorPalette, settings.ditheringStrength);
        }

        return result;
    }

    supportsWorker(): boolean {
        return true;
    }

    private resizeImage(input: ImageData, targetWidth: number, targetHeight: number): ImageData {
        const output = new ImageData(targetWidth, targetHeight);
        const scaleX = input.width / targetWidth;
        const scaleY = input.height / targetHeight;

        for (let y = 0; y < targetHeight; y++) {
            for (let x = 0; x < targetWidth; x++) {
                const srcX = Math.floor(x * scaleX);
                const srcY = Math.floor(y * scaleY);

                const srcIndex = (srcY * input.width + srcX) * 4;
                const dstIndex = (y * targetWidth + x) * 4;

                output.data[dstIndex] = input.data[srcIndex];         // R
                output.data[dstIndex + 1] = input.data[srcIndex + 1]; // G
                output.data[dstIndex + 2] = input.data[srcIndex + 2]; // B
                output.data[dstIndex + 3] = input.data[srcIndex + 3]; // A
            }
        }

        return output;
    }

    private applyColorPalette(input: ImageData, palette: ColorPalette): ImageData {
        const output = new ImageData(
            new Uint8ClampedArray(input.data),
            input.width,
            input.height
        );

        for (let i = 0; i < output.data.length; i += 4) {
            const r = output.data[i];
            const g = output.data[i + 1];
            const b = output.data[i + 2];
            const a = output.data[i + 3];

            // Trouver la couleur la plus proche dans la palette
            const currentColor = { r, g, b, a };
            let closestColor = palette.colors[0];
            let minDistance = colorDistance(currentColor, closestColor);

            for (let j = 1; j < palette.colors.length; j++) {
                const distance = colorDistance(currentColor, palette.colors[j]);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestColor = palette.colors[j];
                }
            }

            output.data[i] = closestColor.r;
            output.data[i + 1] = closestColor.g;
            output.data[i + 2] = closestColor.b;
            output.data[i + 3] = closestColor.a;
        }

        return output;
    }

    private applyDithering(input: ImageData, palette: ColorPalette, strength: number): ImageData {
        const output = new ImageData(
            new Uint8ClampedArray(input.data),
            input.width,
            input.height
        );

        // Floyd-Steinberg dithering
        for (let y = 0; y < input.height; y++) {
            for (let x = 0; x < input.width; x++) {
                const index = (y * input.width + x) * 4;

                const oldR = output.data[index];
                const oldG = output.data[index + 1];
                const oldB = output.data[index + 2];

                // Trouver la couleur la plus proche
                const currentColor = { r: oldR, g: oldG, b: oldB, a: output.data[index + 3] };
                let closestColor = palette.colors[0];
                let minDistance = colorDistance(currentColor, closestColor);

                for (const color of palette.colors) {
                    const distance = colorDistance(currentColor, color);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestColor = color;
                    }
                }

                output.data[index] = closestColor.r;
                output.data[index + 1] = closestColor.g;
                output.data[index + 2] = closestColor.b;

                // Calculer l'erreur
                const errorR = (oldR - closestColor.r) * strength;
                const errorG = (oldG - closestColor.g) * strength;
                const errorB = (oldB - closestColor.b) * strength;

                // Distribuer l'erreur aux pixels voisins
                this.distributeError(output, x + 1, y, errorR * 7/16, errorG * 7/16, errorB * 7/16);
                this.distributeError(output, x - 1, y + 1, errorR * 3/16, errorG * 3/16, errorB * 3/16);
                this.distributeError(output, x, y + 1, errorR * 5/16, errorG * 5/16, errorB * 5/16);
                this.distributeError(output, x + 1, y + 1, errorR * 1/16, errorG * 1/16, errorB * 1/16);
            }
        }

        return output;
    }

    private distributeError(imageData: ImageData, x: number, y: number, errorR: number, errorG: number, errorB: number): void {
        if (x < 0 || x >= imageData.width || y < 0 || y >= imageData.height) return;

        const index = (y * imageData.width + x) * 4;
        imageData.data[index] = Math.max(0, Math.min(255, imageData.data[index] + errorR));
        imageData.data[index + 1] = Math.max(0, Math.min(255, imageData.data[index + 1] + errorG));
        imageData.data[index + 2] = Math.max(0, Math.min(255, imageData.data[index + 2] + errorB));
    }
}