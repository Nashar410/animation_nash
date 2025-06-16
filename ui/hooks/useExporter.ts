// ui/hooks/useExporter.ts
import { useState, useCallback } from 'react';
import { ProcessedFrame, ExportSettings, ExportResult } from '@shared/types';
import { ExporterFactory } from '@core/exporter';

export function useExporter() {
    const [isExporting, setIsExporting] = useState(false);
    const [progress, setProgress] = useState(0);

    const exportFrames = useCallback(async (
        frames: ProcessedFrame[],
        settings: ExportSettings
    ): Promise<ExportResult> => {
        setIsExporting(true);
        setProgress(0);

        try {
            const exporter = ExporterFactory.create(settings.format);
            const result = await exporter.export(frames, settings);

            // Create download link
            const url = URL.createObjectURL(result.blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `spritesheet.${settings.format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setProgress(100);
            return result;
        } finally {
            setIsExporting(false);
        }
    }, []);

    return {
        exportFrames,
        isExporting,
        progress,
    };
}