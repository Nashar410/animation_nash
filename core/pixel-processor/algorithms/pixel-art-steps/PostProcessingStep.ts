// core/pixel-processor/algorithms/pixel-art-steps/PostProcessingStep.ts
import { PixelSettings } from '@shared/types/pixelart';
import { IProcessingStep } from './IProcessingStep';

export class PostProcessingStep implements IProcessingStep {
    execute(input: ImageData, _settings: PixelSettings): ImageData {
        const output = new ImageData(new Uint8ClampedArray(input.data), input.width, input.height);
        this.removeIsolatedPixels(output);
        this.smoothEdges(output);
        return output;
    }

    private removeIsolatedPixels(image: ImageData): void {
        const width = image.width, height = image.height;
        const temp = new Uint8ClampedArray(image.data);
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = (y * width + x) * 4;
                let similarCount = 0;
                const centerR = temp[idx], centerG = temp[idx + 1], centerB = temp[idx + 2];
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (dx === 0 && dy === 0) continue;
                        const nIdx = ((y + dy) * width + (x + dx)) * 4;
                        const diff = Math.abs(centerR - temp[nIdx]) + Math.abs(centerG - temp[nIdx + 1]) + Math.abs(centerB - temp[nIdx + 2]);
                        if (diff < 30) similarCount++;
                    }
                }
                if (similarCount < 2) {
                    let r = 0, g = 0, b = 0, count = 0;
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            if (dx === 0 && dy === 0) continue;
                            const nIdx = ((y + dy) * width + (x + dx)) * 4;
                            r += temp[nIdx]; g += temp[nIdx + 1]; b += temp[nIdx + 2];
                            count++;
                        }
                    }
                    image.data[idx] = Math.round(r / count);
                    image.data[idx + 1] = Math.round(g / count);
                    image.data[idx + 2] = Math.round(b / count);
                }
            }
        }
    }

    private smoothEdges(image: ImageData): void {
        const width = image.width, height = image.height;
        const temp = new Uint8ClampedArray(image.data);
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = (y * width + x) * 4;
                let gx = 0, gy = 0;
                gx += temp[((y - 1) * width + (x - 1)) * 4] * -1;
                gx += temp[((y) * width + (x - 1)) * 4] * -2;
                gx += temp[((y + 1) * width + (x - 1)) * 4] * -1;
                gx += temp[((y - 1) * width + (x + 1)) * 4] * 1;
                gx += temp[((y) * width + (x + 1)) * 4] * 2;
                gx += temp[((y + 1) * width + (x + 1)) * 4] * 1;
                gy += temp[((y - 1) * width + (x - 1)) * 4] * -1;
                gy += temp[((y - 1) * width + (x)) * 4] * -2;
                gy += temp[((y - 1) * width + (x + 1)) * 4] * -1;
                gy += temp[((y + 1) * width + (x - 1)) * 4] * 1;
                gy += temp[((y + 1) * width + (x)) * 4] * 2;
                gy += temp[((y + 1) * width + (x + 1)) * 4] * 1;
                const gradient = Math.sqrt(gx * gx + gy * gy);
                if (gradient > 50) {
                    let r = 0, g = 0, b = 0;
                    const weights = [0.05, 0.1, 0.05, 0.1, 0.4, 0.1, 0.05, 0.1, 0.05];
                    let wIdx = 0;
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            const nIdx = ((y + dy) * width + (x + dx)) * 4;
                            r += temp[nIdx] * weights[wIdx];
                            g += temp[nIdx + 1] * weights[wIdx];
                            b += temp[nIdx + 2] * weights[wIdx];
                            wIdx++;
                        }
                    }
                    image.data[idx] = Math.round(r);
                    image.data[idx + 1] = Math.round(g);
                    image.data[idx + 2] = Math.round(b);
                }
            }
        }
    }
}
