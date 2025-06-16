// shared/types/app.ts
import {Model3D} from "@shared/types/models.ts";
import {RenderSettings, Size} from "@shared/types/rendering.ts";
import {PixelSettings, ProcessedFrame} from "@shared/types/pixelart.ts";
import {ExportSettings} from "@shared/types/export.ts";

export interface AppState {
    model: Model3D | null;
    selectedPreset: string | null;
    renderSettings: RenderSettings;
    pixelSettings: PixelSettings;
    exportSettings: ExportSettings;
    processedFrames: ProcessedFrame[];
    isProcessing: boolean;
    error: Error | null;
}

export interface AppConfig {
    maxFileSize: number;
    supportedFormats: string[];
    defaultRenderSize: Size;
    defaultPixelSize: Size;
    workerEnabled: boolean;
}

export type AppEvent =
    | { type: 'MODEL_LOADED'; payload: Model3D }
    | { type: 'PRESET_SELECTED'; payload: string }
    | { type: 'SETTINGS_UPDATED'; payload: Partial<AppState> }
    | { type: 'PROCESSING_STARTED' }
    | { type: 'PROCESSING_COMPLETED'; payload: ProcessedFrame[] }
    | { type: 'ERROR_OCCURRED'; payload: Error };