// core/camera-system/__tests__/Presets.test.ts
import { PokemonPreset } from '../presets/PokemonPreset';
import { FFPreset } from '../presets/FFPreset';
import { ChronoTriggerPreset } from '../presets/ChronoTriggerPreset';
import { ZeldaPreset } from '../presets/ZeldaPreset';
import { Camera } from '@shared/types';

describe('Presets', () => {
    const testCamera: Camera = {
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0, w: 1 },
        fov: 60,
        near: 0.1,
        far: 100,
        type: 'perspective',
    };

    describe('PokemonPreset', () => {
        it('should have correct configuration', () => {
            const preset = new PokemonPreset();
            const info = preset.getInfo();

            expect(info.id).toBe('pokemon');
            expect(info.name).toBe('Pokémon Style');
            expect(info.camera.fov).toBe(30);
            expect(info.camera.type).toBe('perspective');
        });

        it('should apply camera settings', () => {
            const preset = new PokemonPreset();
            const camera = preset.applyToCamera(testCamera);

            expect(camera.position).toEqual({ x: 10, y: 10, z: 10 });
            expect(camera.fov).toBe(30);
        });

        it('should return render settings', () => {
            const preset = new PokemonPreset();
            const settings = preset.getRenderSettings();

            expect(settings.antialias).toBe(false);
            expect(settings.shadows).toBe(false);
        });

        it('should return pixel settings', () => {
            const preset = new PokemonPreset();
            const settings = preset.getPixelSettings();

            expect(settings.targetSize).toEqual({ width: 64, height: 64 });
            expect(settings.pixelScale).toBe(4);
            expect(settings.dithering).toBe(false);
        });
    });

    describe('FFPreset', () => {
        it('should have correct configuration', () => {
            const preset = new FFPreset();
            const info = preset.getInfo();

            expect(info.id).toBe('final-fantasy');
            expect(info.camera.fov).toBe(25);
            expect(info.pixelSettings?.dithering).toBe(true);
        });
    });

    describe('ChronoTriggerPreset', () => {
        it('should have top-down view with slight angle', () => {
            const preset = new ChronoTriggerPreset();
            const info = preset.getInfo();

            expect(info.camera.position.y).toBe(20);
            expect(info.camera.position.z).toBe(5);
        });
    });

    describe('ZeldaPreset', () => {
        it('should have orthographic camera', () => {
            const preset = new ZeldaPreset();
            const info = preset.getInfo();

            expect(info.camera.type).toBe('orthographic');
            expect(info.camera.orthographicSize).toBe(10);
        });
    });
});