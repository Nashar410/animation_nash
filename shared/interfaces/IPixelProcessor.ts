// shared/interfaces/IPixelProcessor.ts - Version corrigée
import {
    ProcessedFrame,
    PixelSettings,
    PixelAlgorithm
} from '@shared/types';
import { IPixelAlgorithm } from './IAlgorithm';

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
     * Change l'algorithme de traitement - CORRIGÉ
     */
    setAlgorithm(algorithm: IPixelAlgorithm): void;

    /**
     * Libère les ressources
     */
    dispose(): void;
}