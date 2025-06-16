// core/pixel-processor/__tests__/AlgorithmFactory.test.ts
import { AlgorithmFactory } from '../algorithms/AlgorithmFactory';
import { NearestNeighbor } from '../algorithms/NearestNeighbor';
import { BilinearPixel } from '../algorithms/BilinearPixel';

describe('AlgorithmFactory', () => {
    describe('create', () => {
        it('should create NearestNeighbor algorithm', () => {
            const algorithm = AlgorithmFactory.create('nearest-neighbor');
            expect(algorithm).toBeInstanceOf(NearestNeighbor);
        });

        it('should create BilinearPixel algorithm', () => {
            const algorithm = AlgorithmFactory.create('bilinear');
            expect(algorithm).toBeInstanceOf(BilinearPixel);
        });

        it('should throw error for unknown algorithm', () => {
            expect(() => AlgorithmFactory.create('unknown' as any)).toThrow('Unknown algorithm');
        });
    });

    describe('getAvailableAlgorithms', () => {
        it('should return list of available algorithms', () => {
            const algorithms = AlgorithmFactory.getAvailableAlgorithms();
            expect(algorithms).toContain('nearest-neighbor');
            expect(algorithms).toContain('bilinear');
        });
    });
});