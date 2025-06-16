// core/pixel-processor/algorithms/AlgorithmFactory.ts
import { IPixelAlgorithm } from '@shared/interfaces';
import { PixelAlgorithm } from '@shared/types/pixelart';
import { BilinearPixel } from './BilinearPixel';
import {NearestNeighbor} from "@core/pixel-processor/algorithms/NearestNeighbor.ts";

export class AlgorithmFactory {
    private static algorithms: Map<PixelAlgorithm, new () => IPixelAlgorithm> = new Map([
        ['nearest-neighbor', NearestNeighbor],
        ['bilinear', BilinearPixel],
        // Ajouter d'autres algorithmes ici
    ]);

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