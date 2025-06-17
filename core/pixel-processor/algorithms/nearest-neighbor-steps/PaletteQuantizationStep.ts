// core/pixel-processor/algorithms/nearest-neighbor-steps/PaletteQuantizationStep.ts
import { IProcessingStep } from '../pixel-art-steps/IProcessingStep';
import { PixelSettings } from '@shared/types';
import { findClosestColor } from '@shared/utils/color';

export class PaletteQuantizationStep implements IProcessingStep {
    execute(input: ImageData, settings: PixelSettings): ImageData {
        if (!settings.colorPalette) return input;

        const output = new ImageData(new Uint8ClampedArray(input.data), input.width, input.height);
        for (let i = 0; i < output.data.length; i += 4) {
            const currentColor = { r: output.data[i], g: output.data[i+1], b: output.data[i+2], a: output.data[i+3] };
            const closestColor = findClosestColor(currentColor, settings.colorPalette);
            output.data[i] = closestColor.r;
            output.data[i+1] = closestColor.g;
            output.data[i+2] = closestColor.b;
            output.data[i+3] = closestColor.a;
        }
        return output;
    }
}
