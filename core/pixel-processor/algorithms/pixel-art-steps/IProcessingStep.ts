// core/pixel-processor/algorithms/pixel-art-steps/IProcessingStep.ts
import { PixelSettings } from '@shared/types/pixelart';

export interface IProcessingStep {
    execute(input: ImageData, settings: PixelSettings): ImageData;
}
