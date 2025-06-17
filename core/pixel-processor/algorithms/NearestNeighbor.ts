// core/pixel-processor/algorithms/NearestNeighbor.ts (Refactored)
import { IPixelAlgorithm } from '@shared/interfaces';
import { PixelSettings } from '@shared/types';
import { IProcessingStep } from './pixel-art-steps/IProcessingStep';
import { FinalAdjustmentsStep } from './pixel-art-steps/FinalAdjustmentsStep';
import { InputCleaningStep } from './nearest-neighbor-steps/InputCleaningStep';
import { SmoothResizeStep } from './nearest-neighbor-steps/SmoothResizeStep';
import { ArtifactRemovalStep } from './nearest-neighbor-steps/ArtifactRemovalStep';
import { PaletteQuantizationStep } from './nearest-neighbor-steps/PaletteQuantizationStep';
import { DitheringStep } from './nearest-neighbor-steps/DitheringStep';

export class NearestNeighbor implements IPixelAlgorithm {
    public readonly name = 'nearest-neighbor' as const;
    private readonly pipeline: IProcessingStep[];

    constructor() {
        // NOTE: On réutilise FinalAdjustmentsStep du pipeline de PixelArtAlgorithm !
        this.pipeline = [
            new InputCleaningStep(),
            new SmoothResizeStep(),
            new ArtifactRemovalStep(),
            new PaletteQuantizationStep(),
            new DitheringStep(),
            new FinalAdjustmentsStep(),
        ];
    }

    apply(input: ImageData, settings: PixelSettings): ImageData {
        return this.pipeline.reduce(
            (currentImage, step) => step.execute(currentImage, settings),
            input
        );
    }

    supportsWorker(): boolean {
        return true;
    }
}
