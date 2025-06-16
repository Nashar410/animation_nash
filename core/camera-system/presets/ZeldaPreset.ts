// core/camera-system/presets/ZeldaPreset.ts
import { BasePreset } from './BasePreset';

export class ZeldaPreset extends BasePreset {
    constructor() {
        super({
            id: 'zelda-alttp',
            name: 'Zelda (A Link to the Past) Style',
            description: 'Top-down view like classic Zelda games',
            camera: {
                position: { x: 0, y: 25, z: 0 },
                rotation: { x: 0, y: 0, z: 0, w: 1 }, // Pure top-down
                fov: 40,
                near: 0.1,
                far: 100,
                type: 'orthographic',
                orthographicSize: 10,
            },
            renderSettings: {
                backgroundColor: { r: 92, g: 148, b: 252, a: 255 }, // Light blue
                antialias: false,
                shadows: false,
            },
            pixelSettings: {
                targetSize: { width: 16, height: 24 },
                pixelScale: 3,
                dithering: false,
            },
        });
    }
}