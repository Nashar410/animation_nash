// core/pixel-processor/algorithms/AlgorithmFactory.ts - Version finale corrigée
import { IPixelAlgorithm } from '@shared/interfaces';
import { PixelAlgorithm } from '@shared/types/pixelart';
import { NearestNeighbor } from './NearestNeighbor';
import { BilinearPixel } from './BilinearPixel';

export class AlgorithmFactory {
    // Solution: Simplifier le type avec une interface plus générique
    private static algorithms: Map<PixelAlgorithm, new () => IPixelAlgorithm> = new Map();

    // Initialisation statique pour éviter les problèmes de types
    static {
        this.algorithms.set('nearest-neighbor', NearestNeighbor);
        this.algorithms.set('bilinear', BilinearPixel);
    }

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