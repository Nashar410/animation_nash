// core/pixel-processor/__tests__/BilinearPixel.test.ts
import { BilinearPixel } from '../algorithms/BilinearPixel';
import { PixelSettings } from '@shared/types/pixelart';

describe('BilinearPixel', () => {
    let algorithm: BilinearPixel;
    let testImage: ImageData;
    let settings: PixelSettings;

    beforeEach(() => {
        algorithm = new BilinearPixel();

        // Create a simple 2x2 checkerboard pattern
        testImage = new ImageData(
            new Uint8ClampedArray([
                255, 255, 255, 255,  // White
                0, 0, 0, 255,        // Black
                0, 0, 0, 255,        // Black
                255, 255, 255, 255   // White
            ]),
            2,
            2
        );

        settings = {
            targetSize: { width: 4, height: 4 },
            pixelScale: 1,
            dithering: false,
            ditheringStrength: 0,
            contrastBoost: 0,
            brightnessAdjust: 0,
        };
    });

    it('should have correct name', () => {
        expect(algorithm.name).toBe('bilinear');
    });

    it('should upscale image with interpolation', () => {
        const result = algorithm.apply(testImage, settings);

        expect(result.width).toBe(4);
        expect(result.height).toBe(4);

        // Center pixels should be gray (interpolated between black and white)
        const centerIndex = (1 * 4 + 1) * 4; // (1,1) position
        const centerValue = result.data[centerIndex];

        expect(centerValue).toBeGreaterThan(0);
        expect(centerValue).toBeLessThan(255);
    })