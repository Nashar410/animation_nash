// core/pixel-processor/algorithms/PixelArtAlgorithm.ts (Refactored)
import { IPixelAlgorithm } from '@shared/interfaces';
import { PixelSettings } from '@shared/types/pixelart';
import { IProcessingStep } from './pixel-art-steps/IProcessingStep';
import { PreProcessingStep } from './pixel-art-steps/PreProcessingStep';
import { SmartResizeStep } from './pixel-art-steps/SmartResizeStep';
import { ColorQuantizationStep } from './pixel-art-steps/ColorQuantizationStep';
import { PostProcessingStep } from './pixel-art-steps/PostProcessingStep';
import { FinalAdjustmentsStep } from './pixel-art-steps/FinalAdjustmentsStep';

export class PixelArtAlgorithm implements IPixelAlgorithm {
    public readonly name = 'pixel-art-pro' as const;
    private readonly pipeline: IProcessingStep[];

    constructor() {
        this.pipeline = [
            new PreProcessingStep(),
            new SmartResizeStep(),
            new ColorQuantizationStep(),
            new PostProcessingStep(),
            new FinalAdjustmentsStep(),
        ];
    }

    apply(input: ImageData, settings: PixelSettings): ImageData {

        const result = this.pipeline.reduce(
            (currentImage, step) => step.execute(currentImage, settings),
            input
        );

        return result;
    }

    supportsWorker(): boolean {
        return true;
    }
}
