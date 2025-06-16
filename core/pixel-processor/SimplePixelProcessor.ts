// core/pixel-processor/SimplePixelProcessor.ts
import { PixelProcessor } from './PixelProcessor';
import { IPixelAlgorithm } from '@shared/interfaces';
import { PixelSettings } from '@shared/types/pixelart';

export class SimplePixelProcessor extends PixelProcessor {
    constructor(algorithm: IPixelAlgorithm) {
        super('Simple', algorithm);
    }

    protected async processImage(
        input: ImageData,
        settings: PixelSettings
    ): Promise<ImageData> {
        // Apply the algorithm directly
        const processed = this.algorithm.apply(input, settings);

        // Apply additional processing if needed
        if (settings.contrastBoost > 0 || settings.brightnessAdjust !== 0) {
            return this.adjustColorSettings(processed, settings);
        }

        return processed;
    }

    private adjustColorSettings(
        image: ImageData,
        settings: PixelSettings
    ): ImageData {
        const output = new ImageData(
            new Uint8ClampedArray(image.data),
            image.width,
            image.height
        );

        const contrast = 1 + settings.contrastBoost;
        const brightness = settings.brightnessAdjust;

        for (let i = 0; i < output.data.length; i += 4) {
            // Apply brightness and contrast
            for (let j = 0; j < 3; j++) {
                let value = output.data[i + j];
                // Apply brightness
                value += brightness;
                // Apply contrast
                value = ((value - 128) * contrast) + 128;
                // Clamp to valid range
                output.data[i + j] = Math.max(0, Math.min(255, value));
            }
        }

        return output;
    }
}