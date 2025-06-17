// core/pixel-processor/algorithms/pixel-art-steps/ColorQuantizationStep.ts
import { PixelSettings, ColorPalette } from '@shared/types/pixelart';
import { findClosestColor } from '@shared/utils/color';
import { IProcessingStep } from './IProcessingStep';

export class ColorQuantizationStep implements IProcessingStep {
    execute(input: ImageData, settings: PixelSettings): ImageData {
        if (!settings.colorPalette) {
            return input;
        }
        const output = new ImageData(new Uint8ClampedArray(input.data), input.width, input.height);
        if (settings.dithering) {
            return this.orderedDithering(output, settings.colorPalette, settings.ditheringStrength);
        } else {
            return this.simpleQuantize(output, settings.colorPalette);
        }
    }

    private simpleQuantize(image: ImageData, palette: ColorPalette): ImageData {
        for (let i = 0; i < image.data.length; i += 4) {
            const currentColor = { r: image.data[i], g: image.data[i + 1], b: image.data[i + 2], a: image.data[i + 3] };
            const closestColor = findClosestColor(currentColor, palette);
            image.data[i] = closestColor.r;
            image.data[i + 1] = closestColor.g;
            image.data[i + 2] = closestColor.b;
            image.data[i + 3] = closestColor.a;
        }
        return image;
    }

    private orderedDithering(image: ImageData, palette: ColorPalette, strength: number): ImageData {
        const bayerMatrix = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
        const matrixSize = 4;
        const factor = strength * 64 / 16;
        for (let y = 0; y < image.height; y++) {
            for (let x = 0; x < image.width; x++) {
                const idx = (y * image.width + x) * 4;
                const threshold = (bayerMatrix[y % matrixSize][x % matrixSize] / 16 - 0.5) * factor;
                const modifiedColor = {
                    r: Math.max(0, Math.min(255, image.data[idx] + threshold)),
                    g: Math.max(0, Math.min(255, image.data[idx + 1] + threshold)),
                    b: Math.max(0, Math.min(255, image.data[idx + 2] + threshold)),
                    a: image.data[idx + 3]
                };
                const closestColor = findClosestColor(modifiedColor, palette);
                image.data[idx] = closestColor.r;
                image.data[idx + 1] = closestColor.g;
                image.data[idx + 2] = closestColor.b;
                image.data[idx + 3] = closestColor.a;
            }
        }
        return image;
    }
}
