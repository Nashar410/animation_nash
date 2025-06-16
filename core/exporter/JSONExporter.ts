// core/exporter/JSONExporter.ts
import { Exporter } from './Exporter';
import {
    ProcessedFrame,
    ExportSettings,
    ExportResult,
    ExportFormat,
} from '@shared/types';

export class JSONExporter extends Exporter {
    constructor() {
        super('JSON');
    }

    getSupportedFormats(): ExportFormat[] {
        return ['json'];
    }

    async export(
        frames: ProcessedFrame[],
        settings: ExportSettings
    ): Promise<ExportResult> {
        this.logger.info(`Exporting ${frames.length} frames metadata as JSON`);

        const validation = this.validateExport(frames, settings);
        if (!validation.valid) {
            throw new Error(validation.errors[0].message);
        }

        // Generate metadata
        const metadata = this.generateMetadata(frames, settings);

        // Create JSON blob
        const jsonString = JSON.stringify(metadata, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });

        return {
            blob,
            format: 'json',
            size: { width: 0, height: 0 }, // Not applicable for JSON
            fileSize: blob.size,
            metadata,
        };
    }
}