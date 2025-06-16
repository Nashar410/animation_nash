// core/camera-system/presets/ChronoTriggerPreset.ts
import { BasePreset } from './BasePreset';

export class ChronoTriggerPreset extends BasePreset {
    constructor() {
        super({
            id: 'chrono-trigger',
            name: 'Chrono Trigger Style',
            description: 'Top-down view with slight angle like Chrono Trigger',
            camera: {
                position: { x: 0, y: 20, z: 5 },
                rotation: { x: -0.239, y: 0, z: 0, w: 0.971 }, // Slight forward tilt
                fov: 35,
                near: 0.1,
                far: 100,
                type: 'perspective',
            },
            renderSettings: {
                backgroundColor: { r: 0, g: 0, b: 0, a: 255 },
                antialias: false,
                shadows: false,
            },
            pixelSettings: {
                targetSize: { width: 24, height: 32 },
                pixelScale: 2,
                dithering: false,
            },
        });
    }
}