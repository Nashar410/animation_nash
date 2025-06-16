// core/camera-system/presets/FFPreset.ts
import { BasePreset } from './BasePreset';

export class FFPreset extends BasePreset {
    constructor() {
        super({
            id: 'final-fantasy',
            name: 'Final Fantasy Style',
            description: 'Classic Final Fantasy isometric view',
            camera: {
                position: { x: 15, y: 15, z: 15 },
                rotation: { x: -0.279, y: 0.364, z: 0.115, w: 0.880 }, // Isometric angle
                fov: 25,
                near: 0.1,
                far: 100,
                type: 'perspective',
            },
            renderSettings: {
                backgroundColor: { r: 20, g: 20, b: 30, a: 255 }, // Dark blue
                antialias: true,
                shadows: true,
            },
            pixelSettings: {
                targetSize: { width: 32, height: 48 },
                pixelScale: 3,
                dithering: true,
                ditheringStrength: 0.1,
            },
        });
    }
}