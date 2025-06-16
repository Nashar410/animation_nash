// shared/interfaces/IExporter.ts
import {
    ExportResult,
    ExportFormat,
    ExportSettings
} from '../types/export';
import { ValidationResult } from '../types/models';
import {ProcessedFrame} from "@shared/types/pixelart.ts";

export interface IExporter {
    /**
     * Exporte les frames traitées
     */
    export(
        frames: ProcessedFrame[],
        settings: ExportSettings
    ): Promise<ExportResult>;

    /**
     * Retourne les formats d'export supportés
     */
    getSupportedFormats(): ExportFormat[];

    /**
     * Valide les paramètres d'export
     */
    validateExport(frames: ProcessedFrame[], settings: ExportSettings): ValidationResult;

    /**
     * Estime la taille du fichier final
     */
    estimateFileSize(frames: ProcessedFrame[], settings: ExportSettings): number;
}
