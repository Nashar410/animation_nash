// core/exporter/WebPExporter.ts
import { Exporter } from './Exporter';
import {
    ProcessedFrame,
    ExportSettings,
    ExportResult,
    ExportFormat,
} from '@shared/types';
import { LayoutFactory } from '../spritesheet-generator/layouts/LayoutFactory';

export class WebPExporter extends Exporter {
    constructor() {
        super('WebP');
    }

    getSupportedFormats(): ExportFormat[] {
        return ['webp'];
    }

    async export(
        frames: ProcessedFrame[],
        settings: ExportSettings
    ): Promise<ExportResult> {
        this.logger.info(`Exporting ${frames.length} frames as WebP`);

        const validation = this.validateExport(frames, settings);
        if (!validation.valid) {
            throw new Error(validation.errors[0].message);
        }

        // Create layout
        const layout = LayoutFactory.create(settings.layout);

        // Generate spritesheet
        const canvas = this.spritesheetGenerator.generate(frames, layout, {
            backgroundColor: settings.transparent ? undefined : '#000000',
            format: 'image/webp',
            quality: settings.compression || 0.8,
        });

        // Apply scale
        const scaledCanvas = this.applyScale(canvas, settings.scale);

        // Convert to blob
        const blob = await this.canvasToBlob(
            scaledCanvas,
            'image/webp',
            settings.compression || 0.8
        );

        // Generate metadata
        const metadata = settings.includeMetadata
            ? this.generateMetadata(frames, settings)
            : undefined;

        return {
            blob,
            format: 'webp',
            size: {
                width: scaledCanvas.width,
                height: scaledCanvas.height,
            },
            fileSize: blob.size,
            metadata,
        };
    }

    private applyScale(canvas: HTMLCanvasElement, scale: number): HTMLCanvasElement {
        if (scale === 1) return canvas;

        const scaledCanvas = document.createElement('canvas');
        scaledCanvas.width = canvas.width * scale;
        scaledCanvas.height = canvas.height * scale;

        const ctx = scaledCanvas.getContext('2d');
        if (!ctx) throw new Error('Failed to get canvas context');

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);

        return scaledCanvas;
    }

    private canvasToBlob(
        canvas: HTMLCanvasElement,
        type: string,
        quality: number
    ): Promise<Blob> {
        return new Promise((resolve, reject) => {
            canvas.toBlob(
                blob => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to create blob'));
                    }
                },
                type,
                quality
            );
        });
    }
}