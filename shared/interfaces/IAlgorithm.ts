
// shared/interfaces/IAlgorithm.ts
import { PixelSettings } from '../types/pixelart';

export interface IPixelAlgorithm {
    /**
     * Nom de l'algorithme
     */
    name: string;

    /**
     * Applique l'algorithme de pixelisation
     */
    apply(input: ImageData, settings: PixelSettings): ImageData;

    /**
     * Indique si l'algorithme supporte le multi-threading
     */
    supportsWorker(): boolean;
}
