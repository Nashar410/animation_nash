// core/pixel-processor/algorithms/nearest-neighbor-steps/SmoothResizeStep.ts
import { IProcessingStep } from '../pixel-art-steps/IProcessingStep';
import { PixelSettings } from '@shared/types';

export class SmoothResizeStep implements IProcessingStep {
    execute(input: ImageData, settings: PixelSettings): ImageData {
        const { width: targetWidth, height: targetHeight } = settings.targetSize;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = input.width;
        tempCanvas.height = input.height;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return input;
        tempCtx.putImageData(input, 0, 0);

        const outputCanvas = document.createElement('canvas');
        outputCanvas.width = targetWidth;
        outputCanvas.height = targetHeight;
        const outputCtx = outputCanvas.getContext('2d');
        if (!outputCtx) return input;

        outputCtx.imageSmoothingEnabled = true;
        outputCtx.imageSmoothingQuality = 'high';
        outputCtx.drawImage(tempCanvas, 0, 0, targetWidth, targetHeight);

        return outputCtx.getImageData(0, 0, targetWidth, targetHeight);
    }
}
