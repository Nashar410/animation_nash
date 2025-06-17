// core/pixel-processor/algorithms/nearest-neighbor-steps/ArtifactRemovalStep.ts
import { IProcessingStep } from '../pixel-art-steps/IProcessingStep';
import { PixelSettings } from '@shared/types';

export class ArtifactRemovalStep implements IProcessingStep {
    execute(input: ImageData, _settings: PixelSettings): ImageData {
        const output = new ImageData(new Uint8ClampedArray(input.data), input.width, input.height);
        for (let y = 1; y < input.height - 1; y++) {
            for (let x = 1; x < input.width - 1; x++) {
                const centerIdx = (y * input.width + x) * 4;
                let neighborSumR = 0, neighborSumG = 0, neighborSumB = 0, count = 0;

                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (dx === 0 && dy === 0) continue;
                        const nIdx = ((y + dy) * input.width + (x + dx)) * 4;
                        neighborSumR += input.data[nIdx];
                        neighborSumG += input.data[nIdx + 1];
                        neighborSumB += input.data[nIdx + 2];
                        count++;
                    }
                }
                const avgR = neighborSumR / count, avgG = neighborSumG / count, avgB = neighborSumB / count;
                const diff = Math.abs(input.data[centerIdx] - avgR) + Math.abs(input.data[centerIdx + 1] - avgG) + Math.abs(input.data[centerIdx + 2] - avgB);
                if (diff > 150) { // Artifact threshold
                    output.data[centerIdx] = avgR;
                    output.data[centerIdx + 1] = avgG;
                    output.data[centerIdx + 2] = avgB;
                }
            }
        }
        return output;
    }
}
