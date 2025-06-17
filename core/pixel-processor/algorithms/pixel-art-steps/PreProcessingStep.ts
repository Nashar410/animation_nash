// core/pixel-processor/algorithms/pixel-art-steps/PreProcessingStep.ts
import { PixelSettings } from '@shared/types/pixelart';
import { IProcessingStep } from './IProcessingStep';

export class PreProcessingStep implements IProcessingStep {
    execute(input: ImageData, _settings: PixelSettings): ImageData {
        const output = new ImageData(new Uint8ClampedArray(input.data), input.width, input.height);
        this.enhanceLocalContrast(output);
        this.reduceNoise(output);
        return output;
    }

    private enhanceLocalContrast(image: ImageData): void {
        const width = image.width;
        const height = image.height;
        const blockSize = 8;
        for (let by = 0; by < height; by += blockSize) {
            for (let bx = 0; bx < width; bx += blockSize) {
                const histogram = new Array(256).fill(0);
                let pixelCount = 0;
                for (let y = by; y < Math.min(by + blockSize, height); y++) {
                    for (let x = bx; x < Math.min(bx + blockSize, width); x++) {
                        const idx = (y * width + x) * 4;
                        const brightness = Math.round(0.299 * image.data[idx] + 0.587 * image.data[idx + 1] + 0.114 * image.data[idx + 2]);
                        histogram[brightness]++;
                        pixelCount++;
                    }
                }
                const cdf = new Array(256);
                cdf[0] = histogram[0];
                for (let i = 1; i < 256; i++) {
                    cdf[i] = cdf[i - 1] + histogram[i];
                }
                for (let y = by; y < Math.min(by + blockSize, height); y++) {
                    for (let x = bx; x < Math.min(bx + blockSize, width); x++) {
                        const idx = (y * width + x) * 4;
                        for (let c = 0; c < 3; c++) {
                            const value = image.data[idx + c];
                            const enhanced = Math.round((cdf[value] / pixelCount) * 255);
                            image.data[idx + c] = Math.round(value * 0.3 + enhanced * 0.7);
                        }
                    }
                }
            }
        }
    }

    private reduceNoise(image: ImageData): void {
        const width = image.width;
        const height = image.height;
        const temp = new Uint8ClampedArray(image.data);
        const radius = 2;
        const spatialSigma = 2.0;
        const intensitySigma = 50.0;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const centerIdx = (y * width + x) * 4;
                let weightSum = 0;
                let r = 0, g = 0, b = 0;
                for (let dy = -radius; dy <= radius; dy++) {
                    for (let dx = -radius; dx <= radius; dx++) {
                        const ny = y + dy, nx = x + dx;
                        if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
                            const neighborIdx = (ny * width + nx) * 4;
                            const spatialDist = Math.sqrt(dx * dx + dy * dy);
                            const spatialWeight = Math.exp(-(spatialDist * spatialDist) / (2 * spatialSigma * spatialSigma));
                            const intensityDiff = Math.sqrt(Math.pow(temp[centerIdx] - temp[neighborIdx], 2) + Math.pow(temp[centerIdx + 1] - temp[neighborIdx + 1], 2) + Math.pow(temp[centerIdx + 2] - temp[neighborIdx + 2], 2));
                            const intensityWeight = Math.exp(-(intensityDiff * intensityDiff) / (2 * intensitySigma * intensitySigma));
                            const weight = spatialWeight * intensityWeight;
                            weightSum += weight;
                            r += temp[neighborIdx] * weight;
                            g += temp[neighborIdx + 1] * weight;
                            b += temp[neighborIdx + 2] * weight;
                        }
                    }
                }
                if (weightSum > 0) {
                    image.data[centerIdx] = Math.round(r / weightSum);
                    image.data[centerIdx + 1] = Math.round(g / weightSum);
                    image.data[centerIdx + 2] = Math.round(b / weightSum);
                }
            }
        }
    }
}
