// core/pixel-processor/algorithms/nearest-neighbor-steps/DitheringStep.ts
import { IProcessingStep } from '../pixel-art-steps/IProcessingStep';
import { PixelSettings, ColorPalette } from '@shared/types';
import { findClosestColor } from '@shared/utils/color';

export class DitheringStep implements IProcessingStep {
    execute(input: ImageData, settings: PixelSettings): ImageData {
        if (!settings.dithering || !settings.colorPalette) return input;

        const output = new ImageData(new Uint8ClampedArray(input.data), input.width, input.height);
        for (let y = 0; y < input.height; y++) {
            for (let x = 0; x < input.width; x++) {
                const index = (y * input.width + x) * 4;
                const oldColor = { r: output.data[index], g: output.data[index+1], b: output.data[index+2], a: output.data[index+3] };
                const newColor = findClosestColor(oldColor, settings.colorPalette);

                output.data[index] = newColor.r;
                output.data[index + 1] = newColor.g;
                output.data[index + 2] = newColor.b;

                const errorR = (oldColor.r - newColor.r) * settings.ditheringStrength;
                const errorG = (oldColor.g - newColor.g) * settings.ditheringStrength;
                const errorB = (oldColor.b - newColor.b) * settings.ditheringStrength;

                this.distributeError(output, x + 1, y, errorR * 7 / 16, errorG * 7 / 16, errorB * 7 / 16);
                this.distributeError(output, x - 1, y + 1, errorR * 3 / 16, errorG * 3 / 16, errorB * 3 / 16);
                this.distributeError(output, x, y + 1, errorR * 5 / 16, errorG * 5 / 16, errorB * 5 / 16);
                this.distributeError(output, x + 1, y + 1, errorR * 1 / 16, errorG * 1 / 16, errorB * 1 / 16);
            }
        }
        return output;
    }

    private distributeError(image: ImageData, x: number, y: number, r: number, g: number, b: number): void {
        if (x < 0 || x >= image.width || y < 0 || y >= image.height) return;
        const index = (y * image.width + x) * 4;
        image.data[index] = Math.max(0, Math.min(255, image.data[index] + r));
        image.data[index+1] = Math.max(0, Math.min(255, image.data[index+1] + g));
        image.data[index+2] = Math.max(0, Math.min(255, image.data[index+2] + b));
    }
}
