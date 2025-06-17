// core/pixel-processor/algorithms/nearest-neighbor-steps/InputCleaningStep.ts
import { IProcessingStep } from '../pixel-art-steps/IProcessingStep';
import { PixelSettings } from '@shared/types';

export class InputCleaningStep implements IProcessingStep {
    execute(input: ImageData, _settings: PixelSettings): ImageData {
        const output = new ImageData(new Uint8ClampedArray(input.data), input.width, input.height);
        // Filtrage médian simple pour réduire le bruit
        for (let y = 1; y < input.height - 1; y++) {
            for (let x = 1; x < input.width - 1; x++) {
                for (let c = 0; c < 3; c++) {
                    const values: number[] = [];
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            const idx = ((y + dy) * input.width + (x + dx)) * 4 + c;
                            values.push(input.data[idx]);
                        }
                    }
                    values.sort((a, b) => a - b);
                    const median = values[Math.floor(values.length / 2)];
                    output.data[(y * input.width + x) * 4 + c] = median;
                }
            }
        }
        return output;
    }
}
