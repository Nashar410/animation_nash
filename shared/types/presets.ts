// shared/types/presets.ts
import {PixelSettings} from "@shared/types/pixelart.ts";
import {Camera, RenderSettings} from "@shared/types/rendering.ts";

export interface CameraPreset {
    id: string;
    name: string;
    description: string;
    camera: Camera;
    renderSettings: Partial<RenderSettings>;
    pixelSettings: Partial<PixelSettings>;
    thumbnail?: string;
}

export interface PresetCategory {
    id: string;
    name: string;
    description: string;
    presets: CameraPreset[];
}