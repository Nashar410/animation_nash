// core/pixel-processor/algorithms/AlgorithmFactory.ts - Version finale corrigée
import { IPixelAlgorithm } from '@shared/interfaces';
import { PixelAlgorithm } from '@shared/types/pixelart';
import { NearestNeighbor } from './NearestNeighbor';
import { BilinearPixel } from './BilinearPixel';
import { PixelArtAlgorithm } from './PixelArtAlgorithm'; // Importer le nouvel algo

export class AlgorithmFactory {
    private static algorithms: Map<PixelAlgorithm, new () => IPixelAlgorithm> = new Map();

    // Initialisation statique pour enregistrer tous les algorithmes
    static {
        this.register('nearest-neighbor', NearestNeighbor);
        this.register('bilinear', BilinearPixel);
        this.register('pixel-art-pro', PixelArtAlgorithm); // Enregistrer le nouvel algo
        // Les autres ('bicubic', 'lanczos') peuvent être ajoutés ici quand ils seront implémentés
    }

    static create(algorithm: PixelAlgorithm): IPixelAlgorithm {
        const AlgorithmClass = this.algorithms.get(algorithm);
        if (!AlgorithmClass) {
            // Message d'erreur plus clair
            throw new Error(`Algorithm '${algorithm}' not found or not registered.`);
        }
        return new AlgorithmClass();
    }

    static register(name: PixelAlgorithm, algorithmClass: new () => IPixelAlgorithm): void {
        if (this.algorithms.has(name)) {
            console.warn(`Algorithm '${name}' is being overridden.`);
        }
        this.algorithms.set(name, algorithmClass);
    }

    static getAvailableAlgorithms(): PixelAlgorithm[] {
        return Array.from(this.algorithms.keys());
    }
}
