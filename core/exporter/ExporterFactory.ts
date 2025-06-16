// core/exporter/ExporterFactory.ts
import { IExporter } from '@shared/interfaces';
import { ExportFormat } from '@shared/types';
import { PNGExporter } from './PNGExporter';
import { WebPExporter } from './WebPExporter';
import { JSONExporter } from './JSONExporter';

export class ExporterFactory {
    private static exporters: Map<ExportFormat, new () => IExporter> = new Map([
        ['png', PNGExporter],
        ['webp', WebPExporter],
        ['json', JSONExporter],
    ]);

    static create(format: ExportFormat): IExporter {
        const ExporterClass = this.exporters.get(format);
        if (!ExporterClass) {
            throw new Error(`Unknown export format: ${format}`);
        }
        return new ExporterClass();
    }

    static getAvailableFormats(): ExportFormat[] {
        return Array.from(this.exporters.keys());
    }
}