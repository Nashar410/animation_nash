// core/pixel-processor/__tests__/PixelProcessor.test.ts
import { SimplePixelProcessor } from '../SimplePixelProcessor';
import { NearestNeighbor } from '../algorithms/NearestNeighbor';
import { PixelSettings } from '@shared/types/pixelart';

describe('PixelProcessor', () => {
    let processor: SimplePixelProcessor;
    let mockImageData: ImageData;
    let settings: PixelSettings;

    beforeEach(() => {
        processor = new SimplePixelProcessor(new NearestNeighbor());

        // Create a simple 2x2 test image
        mockImageData = new ImageData(
            new Uint8ClampedArray([
                255, 0, 0, 255,    // Red
                0, 255, 0, 255,    // Green
                0, 0, 255, 255,    // Blue
                255, 255, 255, 255 // White
            ]),
            2,
            2
        );

        settings = {
            targetSize: { width: 1, height: 1 },
            pixelScale: 1,
            dithering: false,
            ditheringStrength: 0,
            contrastBoost: 0,
            brightnessAdjust: 0,
        };
    });

    describe('process', () => {
        it('should process a single frame', async () => {
            const result = await processor.process(mockImageData, settings);

            expect(result).toBeDefined();
            expect(result.id).toBeTruthy();
            expect(result.original).toBe(mockImageData);
            expect(result.processed).toBeInstanceOf(ImageData);
            expect(result.processingTime).toBeGreaterThan(0);
        });

        it('should resize image to target size', async () => {
            const result = await processor.process(mockImageData, settings);

            expect(result.processed.width).toBe(1);
            expect(result.processed.height).toBe(1);
        });
    });

    describe('processBatch', () => {
        it('should process multiple frames', async () => {
            const frames = [mockImageData, mockImageData, mockImageData];
            const results = await processor.processBatch(frames, settings);

            expect(results).toHaveLength(3);
            results.forEach((result, index) => {
                expect(result.frameNumber).toBe(index);
                expect(result.processed).toBeInstanceOf(ImageData);
            });
        });
    });

    describe('getAlgorithm/setAlgorithm', () => {
        it('should get current algorithm', () => {
            expect(processor.getAlgorithm()).toBe('nearest-neighbor');
        });

        it('should change algorithm', () => {
            const newAlgorithm = {
                name: 'test-algorithm',
                apply: jest.fn().mockReturnValue(mockImageData),
                supportsWorker: () => false,
            };

            processor.setAlgorithm(newAlgorithm);
            expect(processor.getAlgorithm()).toBe('test-algorithm');
        });
    });

    describe('color adjustments', () => {
        it('should apply brightness adjustment', async () => {
            settings.brightnessAdjust = 50;
            const result = await processor.process(mockImageData, settings);

            // Check that brightness was applied
            const data = result.processed.data;
            expect(data[0]).toBeGreaterThan(0); // Red channel should be brighter
        });

        it('should apply contrast boost', async () => {
            settings.contrastBoost = 0.5;
            const result = await processor.process(mockImageData, settings);

            expect(result.processed).toBeDefined();
        });
    });
});