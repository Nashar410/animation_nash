// core/pixel-processor/__tests__/NearestNeighbor.test.ts
import { NearestNeighbor } from '../algorithms/NearestNeighbor';
import { PixelSettings } from '@shared/types/pixelart';
import { PalettePresets } from '../palettes/PalettePresets';

describe('NearestNeighbor', () => {
    let algorithm: NearestNeighbor;
    let testImage: ImageData;
    let settings: PixelSettings;

    beforeEach(() => {
        algorithm = new NearestNeighbor();

        // Create a 4x4 test image with gradient
        const data = new Uint8ClampedArray(4 * 4 * 4);
        for (let i = 0; i < 16; i++) {
            const value = (i / 15) * 255;
            data[i * 4] = value;     // R
            data[i * 4 + 1] = value; // G
            data[i * 4 + 2] = value; // B
            data[i * 4 + 3] = 255;   // A
        }
        testImage = new ImageData(data, 4, 4);

        settings = {
            targetSize: { width: 2, height: 2 },
            pixelScale: 1,
            dithering: false,
            ditheringStrength: 0,
            contrastBoost: 0,
            brightnessAdjust: 0,
        };
    });

    it('should have correct name', () => {
        expect(algorithm.name).toBe('nearest-neighbor');
    });

    it('should support web workers', () => {
        expect(algorithm.supportsWorker()).toBe(true);
    });

    it('should downscale image correctly', () => {
        const result = algorithm.apply(testImage, settings);

        expect(result.width).toBe(2);
        expect(result.height).toBe(2);
        expect(result.data.length).toBe(2 * 2 * 4);
    });

    it('should apply color palette', () => {
        settings.colorPalette = PalettePresets.gameboy;
        const result = algorithm.apply(testImage, settings);

        // Check that all pixels use palette colors
        for (let i = 0; i < result.data.length; i += 4) {
            const r = result.data[i];
            const g = result.data[i + 1];
            const b = result.data[i + 2];

            const matchesPalette = PalettePresets.gameboy.colors.some(
                color => color.r === r && color.g === g && color.b === b
            );

            expect(matchesPalette).toBe(true);
        }
    });

    it('should apply dithering when enabled', () => {
        settings.colorPalette = PalettePresets.gameboy;
        settings.dithering = true;
        settings.ditheringStrength = 0.5;

        const withoutDithering = algorithm.apply(testImage, { ...settings, dithering: false });
        const withDithering = algorithm.apply(testImage, settings);

        // Dithering should produce different results
        let isDifferent = false;
        for (let i = 0; i < withoutDithering.data.length; i++) {
            if (withoutDithering.data[i] !== withDithering.data[i]) {
                isDifferent = true;
                break;
            }
        }

        expect(isDifferent).toBe(true);
    });
});