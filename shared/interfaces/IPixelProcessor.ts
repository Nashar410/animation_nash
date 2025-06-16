
// shared/interfaces/IPixelProcessor.ts
import {
    ProcessedFrame,
    PixelSettings,
    PixelAlgorithm
} from '../types/pixelart';

export interface IPixelProcessor {
    /**
     * Traite une image pour la convertir en pixel art
     */
    process(input: ImageData, settings: PixelSettings): Promise<ProcessedFrame>;

    /**
     * Traite un lot d'images
     */
    processBatch(
        inputs: ImageData[],
        settings: PixelSettings
    ): Promise<ProcessedFrame[]>;

    /**
     * Retourne l'algorithme actuel
     */
    getAlgorithm(): PixelAlgorithm;

    /**
     * Change l'algorithme de traitement
     */
    setAlgorithm(algorithm: PixelAlgorithm): void;

    /**
     * Libère les ressources
     */
    dispose(): void;
}