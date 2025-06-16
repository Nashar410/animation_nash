// shared/interfaces/IModelLoader.ts
import { Model3D, ValidationResult } from '../types/models';

export interface IModelLoader {
    /**
     * Charge un modèle 3D à partir d'un fichier
     */
    loadModel(file: File): Promise<Model3D>;

    /**
     * Retourne les formats de fichier supportés
     */
    getSupportedFormats(): string[];

    /**
     * Valide un modèle 3D chargé
     */
    validateModel(model: Model3D): ValidationResult;

    /**
     * Libère les ressources
     */
    dispose(): void;
}




