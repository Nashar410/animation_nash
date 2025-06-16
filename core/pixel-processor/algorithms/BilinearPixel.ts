// Remplacer le require() par un import
import { IPixelAlgorithm } from '@shared/interfaces';
import { PixelSettings } from '@shared/types/pixelart';
import { NearestNeighbor } from './NearestNeighbor';

export class BilinearPixel implements IPixelAlgorithm {
    name = 'bilinear';

    apply(input: ImageData, settings: PixelSettings): ImageData {
        const { width: targetWidth, height: targetHeight } = settings.targetSize;
        const output = new ImageData(targetWidth, targetHeight);

        const scaleX = (input.width - 1) / (targetWidth - 1);
        const scaleY = (input.height - 1) / (targetHeight - 1);

        for (let y = 0; y < targetHeight; y++) {
            for (let x = 0; x < targetWidth; x++) {
                // Calculate source coordinates
                const srcX = x * scaleX;
                const srcY = y * scaleY;

                // Get integer and fractional parts
                const x0 = Math.floor(srcX);
                const y0 = Math.floor(srcY);
                const x1 = Math.min(x0 + 1, input.width - 1);
                const y1 = Math.min(y0 + 1, input.height - 1);

                const fx = srcX - x0;
                const fy = srcY - y0;

                // Get the four surrounding pixels
                const p00 = this.getPixel(input, x0, y0);
                const p10 = this.getPixel(input, x1, y0);
                const p01 = this.getPixel(input, x0, y1);
                const p11 = this.getPixel(input, x1, y1);

                // Bilinear interpolation
                const dstIndex = (y * targetWidth + x) * 4;
                for (let i = 0; i < 4; i++) {
                    const v00 = p00[i];
                    const v10 = p10[i];
                    const v01 = p01[i];
                    const v11 = p11[i];

                    const v0 = v00 * (1 - fx) + v10 * fx;
                    const v1 = v01 * (1 - fx) + v11 * fx;
                    const v = v0 * (1 - fy) + v1 * fy;

                    output.data[dstIndex + i] = Math.round(v);
                }
            }
        }

        // Apply pixelation effect after bilinear scaling
        return this.pixelate(output, settings);
    }

    supportsWorker(): boolean {
        return true;
    }

    private getPixel(image: ImageData, x: number, y: number): number[] {
        const index = (y * image.width + x) * 4;
        return [
            image.data[index],
            image.data[index + 1],
            image.data[index + 2],
            image.data[index + 3],
        ];
    }

    private pixelate(image: ImageData, settings: PixelSettings): ImageData {
        // Apply color quantization if palette is specified
        if (settings.colorPalette) {
            const nearestNeighbor = new NearestNeighbor();
            return nearestNeighbor.apply(image, settings);
        }

        return image;
    }
}