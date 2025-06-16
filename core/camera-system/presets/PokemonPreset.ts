// core/camera-system/presets/PokemonPreset.ts
import { BasePreset } from './BasePreset';

export class PokemonPreset extends BasePreset {
    constructor() {
        super({
            id: 'pokemon',
            name: 'Pokémon Style',
            description: 'Classic Pokémon game perspective with 45° angle',
            camera: {
                position: { x: 10, y: 10, z: 10 },
                rotation: { x: -0.353, y: 0.353, z: 0.146, w: 0.853 }, // 45° angle
                fov: 30,
                near: 0.1,
                far: 100,
                type: 'perspective',
            },
            renderSettings: {
                backgroundColor: { r: 135, g: 206, b: 235, a: 255 }, // Sky blue
                antialias: false,
                shadows: false,
            },
            pixelSettings: {
                targetSize: { width: 64, height: 64 },
                pixelScale: 4,
                dithering: false,
            },
        });
    }
}