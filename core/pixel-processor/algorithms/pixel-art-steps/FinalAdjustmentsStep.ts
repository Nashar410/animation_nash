// core/pixel-processor/algorithms/pixel-art-steps/FinalAdjustmentsStep.ts
import { PixelSettings } from '@shared/types/pixelart';
import { IProcessingStep } from './IProcessingStep';

export class FinalAdjustmentsStep implements IProcessingStep {
    execute(input: ImageData, settings: PixelSettings): ImageData {
        const { brightnessAdjust, contrastBoost } = settings;
        if (contrastBoost <= 0 && brightnessAdjust === 0) {
            return input;
        }

        const output = new ImageData(new Uint8ClampedArray(input.data), input.width, input.height);
        const contrastFactor = (259 * (contrastBoost + 255)) / (255 * (259 - contrastBoost));
        for (let i = 0; i < output.data.length; i += 4) {
            for (let j = 0; j < 3; j++) {
                let value = output.data[i + j];
                value = contrastFactor * (value - 128) + 128; // Contrast
                value += brightnessAdjust; // Brightness
                output.data[i + j] = Math.max(0, Math.min(255, Math.round(value)));
            }
        }
        return output;
    }
}
