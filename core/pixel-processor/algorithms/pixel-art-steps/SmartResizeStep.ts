// core/pixel-processor/algorithms/pixel-art-steps/SmartResizeStep.ts
import { PixelSettings } from '@shared/types/pixelart';
import { IProcessingStep } from './IProcessingStep';

export class SmartResizeStep implements IProcessingStep {
    execute(input: ImageData, settings: PixelSettings): ImageData {
        const { width: targetWidth, height: targetHeight } = settings.targetSize;
        if (input.width > targetWidth || input.height > targetHeight) {
            return this.areaResize(input, targetWidth, targetHeight);
        } else {
            return this.bicubicResize(input, targetWidth, targetHeight);
        }
    }

    private areaResize(input: ImageData, targetWidth: number, targetHeight: number): ImageData {
        const output = new ImageData(targetWidth, targetHeight);
        const xRatio = input.width / targetWidth;
        const yRatio = input.height / targetHeight;
        for (let y = 0; y < targetHeight; y++) {
            for (let x = 0; x < targetWidth; x++) {
                const x1 = x * xRatio, y1 = y * yRatio;
                const x2 = Math.min((x + 1) * xRatio, input.width);
                const y2 = Math.min((y + 1) * yRatio, input.height);
                let r = 0, g = 0, b = 0, a = 0, count = 0;
                for (let sy = Math.floor(y1); sy < y2; sy++) {
                    for (let sx = Math.floor(x1); sx < x2; sx++) {
                        const weight = (Math.min(sx + 1, x2) - Math.max(sx, x1)) * (Math.min(sy + 1, y2) - Math.max(sy, y1));
                        const idx = (sy * input.width + sx) * 4;
                        r += input.data[idx] * weight;
                        g += input.data[idx + 1] * weight;
                        b += input.data[idx + 2] * weight;
                        a += input.data[idx + 3] * weight;
                        count += weight;
                    }
                }
                const outIdx = (y * targetWidth + x) * 4;
                output.data[outIdx] = Math.round(r / count);
                output.data[outIdx + 1] = Math.round(g / count);
                output.data[outIdx + 2] = Math.round(b / count);
                output.data[outIdx + 3] = Math.round(a / count);
            }
        }
        return output;
    }

    private bicubicResize(input: ImageData, targetWidth: number, targetHeight: number): ImageData {
        const output = new ImageData(targetWidth, targetHeight);
        const xRatio = (input.width - 1) / targetWidth;
        const yRatio = (input.height - 1) / targetHeight;
        const cubic = (t: number): number => {
            const a = -0.5;
            t = Math.abs(t);
            if (t <= 1) return (a + 2) * t * t * t - (a + 3) * t * t + 1;
            if (t <= 2) return a * t * t * t - 5 * a * t * t + 8 * a * t - 4 * a;
            return 0;
        };
        for (let y = 0; y < targetHeight; y++) {
            for (let x = 0; x < targetWidth; x++) {
                const sx = x * xRatio, sy = y * yRatio;
                const fx = Math.floor(sx), fy = Math.floor(sy);
                let r = 0, g = 0, b = 0, a = 0;
                for (let m = -1; m <= 2; m++) {
                    for (let n = -1; n <= 2; n++) {
                        const cx = Math.min(Math.max(fx + n, 0), input.width - 1);
                        const cy = Math.min(Math.max(fy + m, 0), input.height - 1);
                        const weight = cubic(sx - (fx + n)) * cubic(sy - (fy + m));
                        const idx = (cy * input.width + cx) * 4;
                        r += input.data[idx] * weight;
                        g += input.data[idx + 1] * weight;
                        b += input.data[idx + 2] * weight;
                        a += input.data[idx + 3] * weight;
                    }
                }
                const outIdx = (y * targetWidth + x) * 4;
                output.data[outIdx] = Math.max(0, Math.min(255, Math.round(r)));
                output.data[outIdx + 1] = Math.max(0, Math.min(255, Math.round(g)));
                output.data[outIdx + 2] = Math.max(0, Math.min(255, Math.round(b)));
                output.data[outIdx + 3] = Math.max(0, Math.min(255, Math.round(a)));
            }
        }
        return output;
    }
}
