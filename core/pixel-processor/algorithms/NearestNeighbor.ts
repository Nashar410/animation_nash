// core/pixel-processor/algorithms/NearestNeighbor.ts - Version anti-artefacts
import { IPixelAlgorithm } from '@shared/interfaces';
import { PixelSettings, ColorPalette } from '@shared/types/pixelart';
import { colorDistance } from '@shared/utils/color';

export class NearestNeighbor implements IPixelAlgorithm {
    name = 'nearest-neighbor' as const;

    apply(input: ImageData, settings: PixelSettings): ImageData {
        console.log(`🔄 Processing ${input.width}x${input.height} → ${settings.targetSize.width}x${settings.targetSize.height}`);

        // CORRECTION 1: Pre-filtrage pour nettoyer l'image d'entrée
        const cleaned = this.cleanInput(input);

        // CORRECTION 2: Redimensionnement avec anti-aliasing contrôlé
        const resized = this.resizeImageSmooth(cleaned, settings.targetSize.width, settings.targetSize.height);

        // CORRECTION 3: Post-traitement pour réduire les artefacts
        let result = this.removeArtefacts(resized);

        // 4. Appliquer la palette de couleurs si spécifiée
        if (settings.colorPalette) {
            result = this.applyColorPalette(result, settings.colorPalette);
        }

        // 5. Appliquer le dithering si activé
        if (settings.dithering && settings.colorPalette) {
            result = this.applyDithering(result, settings.colorPalette, settings.ditheringStrength);
        }

        // CORRECTION 6: Ajustements finaux
        if (settings.contrastBoost > 0 || settings.brightnessAdjust !== 0) {
            result = this.adjustBrightnessContrast(result, settings.brightnessAdjust, settings.contrastBoost);
        }

        console.log('✅ Pixel processing complete');
        return result;
    }

    supportsWorker(): boolean {
        return true;
    }

    // CORRECTION: Nettoyage de l'image d'entrée
    private cleanInput(input: ImageData): ImageData {
        const output = new ImageData(
            new Uint8ClampedArray(input.data),
            input.width,
            input.height
        );

        // Filtrage médian simple pour réduire le bruit
        for (let y = 1; y < input.height - 1; y++) {
            for (let x = 1; x < input.width - 1; x++) {
                for (let c = 0; c < 3; c++) { // RGB seulement
                    const values = [];

                    // Récupérer les valeurs 3x3 autour du pixel
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            const idx = ((y + dy) * input.width + (x + dx)) * 4 + c;
                            values.push(input.data[idx]);
                        }
                    }

                    // Médiane
                    values.sort((a, b) => a - b);
                    const median = values[Math.floor(values.length / 2)];

                    const outIdx = (y * input.width + x) * 4 + c;
                    output.data[outIdx] = median;
                }
            }
        }

        return output;
    }

    // CORRECTION: Redimensionnement avec anti-aliasing contrôlé
    private resizeImageSmooth(input: ImageData, targetWidth: number, targetHeight: number): ImageData {
        // Créer un canvas temporaire pour utiliser le redimensionnement du navigateur
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = input.width;
        tempCanvas.height = input.height;
        const tempCtx = tempCanvas.getContext('2d')!;
        tempCtx.putImageData(input, 0, 0);

        // Canvas de sortie
        const outputCanvas = document.createElement('canvas');
        outputCanvas.width = targetWidth;
        outputCanvas.height = targetHeight;
        const outputCtx = outputCanvas.getContext('2d')!;

        // CORRECTION: Utiliser un algorithme de redimensionnement de qualité
        outputCtx.imageSmoothingEnabled = true;
        outputCtx.imageSmoothingQuality = 'high';

        // Redimensionner
        outputCtx.drawImage(tempCanvas, 0, 0, targetWidth, targetHeight);

        return outputCtx.getImageData(0, 0, targetWidth, targetHeight);
    }

    // CORRECTION: Suppression des artefacts
    private removeArtefacts(input: ImageData): ImageData {
        const output = new ImageData(
            new Uint8ClampedArray(input.data),
            input.width,
            input.height
        );

        // Détection et correction des pixels isolés (artefacts)
        for (let y = 1; y < input.height - 1; y++) {
            for (let x = 1; x < input.width - 1; x++) {
                const centerIdx = (y * input.width + x) * 4;

                // Vérifier si ce pixel est très différent de ses voisins
                let neighborSum = [0, 0, 0];
                let neighborCount = 0;

                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (dx === 0 && dy === 0) continue;

                        const nIdx = ((y + dy) * input.width + (x + dx)) * 4;
                        neighborSum[0] += input.data[nIdx];
                        neighborSum[1] += input.data[nIdx + 1];
                        neighborSum[2] += input.data[nIdx + 2];
                        neighborCount++;
                    }
                }

                const avgR = neighborSum[0] / neighborCount;
                const avgG = neighborSum[1] / neighborCount;
                const avgB = neighborSum[2] / neighborCount;

                const centerR = input.data[centerIdx];
                const centerG = input.data[centerIdx + 1];
                const centerB = input.data[centerIdx + 2];

                // Si le pixel est très différent de la moyenne (artefact probable)
                const diff = Math.abs(centerR - avgR) + Math.abs(centerG - avgG) + Math.abs(centerB - avgB);
                if (diff > 150) { // Seuil d'artefact
                    output.data[centerIdx] = Math.round(avgR);
                    output.data[centerIdx + 1] = Math.round(avgG);
                    output.data[centerIdx + 2] = Math.round(avgB);
                }
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

        // Floyd-Steinberg dithering amélioré
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

                // Calculer l'erreur avec strength
                const errorR = (oldR - closestColor.r) * strength;
                const errorG = (oldG - closestColor.g) * strength;
                const errorB = (oldB - closestColor.b) * strength;

                // Distribuer l'erreur (Floyd-Steinberg)
                this.distributeError(output, x + 1, y, errorR * 7/16, errorG * 7/16, errorB * 7/16);
                this.distributeError(output, x - 1, y + 1, errorR * 3/16, errorG * 3/16, errorB * 3/16);
                this.distributeError(output, x, y + 1, errorR * 5/16, errorG * 5/16, errorB * 5/16);
                this.distributeError(output, x + 1, y + 1, errorR * 1/16, errorG * 1/16, errorB * 1/16);
            }
        }

        return output;
    }

    // CORRECTION: Ajustement luminosité/contraste amélioré
    private adjustBrightnessContrast(input: ImageData, brightness: number, contrast: number): ImageData {
        const output = new ImageData(
            new Uint8ClampedArray(input.data),
            input.width,
            input.height
        );

        const contrastFactor = 1 + contrast;

        for (let i = 0; i < output.data.length; i += 4) {
            for (let j = 0; j < 3; j++) { // RGB seulement
                let value = output.data[i + j];

                // Appliquer luminosité
                value += brightness;

                // Appliquer contraste
                value = ((value - 128) * contrastFactor) + 128;

                // Clamper
                output.data[i + j] = Math.max(0, Math.min(255, Math.round(value)));
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