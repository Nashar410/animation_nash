// core/pixel-processor/algorithms/AlgorithmFactory.ts - Version corrigée
import { IPixelAlgorithm } from '@shared/interfaces';
import { PixelAlgorithm } from '@shared/types/pixelart';
import { NearestNeighbor } from './NearestNeighbor';
import { BilinearPixel } from './BilinearPixel';

export class AlgorithmFactory {
    // Correction: utiliser IPixelAlgorithm au lieu de class constructors spécifiques
    private static algorithms: Map<PixelAlgorithm, new () => IPixelAlgorithm> = new Map([
        ['nearest-neighbor', NearestNeighbor],
        ['bilinear', BilinearPixel],
    ] as const);

    static create(algorithm: PixelAlgorithm): IPixelAlgorithm {
        const AlgorithmClass = this.algorithms.get(algorithm);
        if (!AlgorithmClass) {
            throw new Error(`Unknown algorithm: ${algorithm}`);
        }
        return new AlgorithmClass();
    }

    static register(name: PixelAlgorithm, algorithmClass: new () => IPixelAlgorithm): void {
        this.algorithms.set(name, algorithmClass);
    }

    static getAvailableAlgorithms(): PixelAlgorithm[] {
        return Array.from(this.algorithms.keys());
    }
}