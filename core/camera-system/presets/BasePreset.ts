// core/camera-system/presets/BasePreset.ts
import { IPreset } from '@shared/interfaces';
import { PixelSettings } from '@shared/types/pixelart';
import {CameraPreset} from "@shared/types/presets.ts";
import {Camera, RenderSettings} from "@shared/types/rendering.ts";

export abstract class BasePreset implements IPreset {
    protected preset: CameraPreset;

    constructor(preset: CameraPreset) {
        this.preset = preset;
    }

    getInfo(): CameraPreset {
        return { ...this.preset };
    }

    applyToCamera(camera: Camera): Camera {
        return {
            ...camera,
            ...this.preset.camera,
        };
    }

    getRenderSettings(): Partial<RenderSettings> {
        return this.preset.renderSettings || {};
    }

    getPixelSettings(): Partial<PixelSettings> {
        return this.preset.pixelSettings || {};
    }
}