// core/camera-system/__tests__/PresetFactory.test.ts
import { PresetFactory } from '../presets/PresetFactory';
import { PokemonPreset } from '../presets/PokemonPreset';
import { FFPreset } from '../presets/FFPreset';
import { BasePreset } from '../presets/BasePreset';

describe('PresetFactory', () => {
    describe('create', () => {
        it('should create Pokemon preset', () => {
            const preset = PresetFactory.create('pokemon');
            expect(preset).toBeInstanceOf(PokemonPreset);
        });

        it('should create Final Fantasy preset', () => {
            const preset = PresetFactory.create('final-fantasy');
            expect(preset).toBeInstanceOf(FFPreset);
        });

        it('should throw error for unknown preset', () => {
            expect(() => PresetFactory.create('unknown')).toThrow('Unknown preset');
        });
    });

    describe('register', () => {
        it('should register custom preset', () => {
            class CustomPreset extends BasePreset {
                constructor() {
                    super({
                        id: 'custom',
                        name: 'Custom Preset',
                        description: 'Test preset',
                        camera: {
                            position: { x: 0, y: 0, z: 0 },
                            rotation: { x: 0, y: 0, z: 0, w: 1 },
                            fov: 60,
                            near: 0.1,
                            far: 100,
                            type: 'perspective',
                        },
                        // Propriétés manquantes ajoutées :
                        renderSettings: {
                            backgroundColor: { r: 0, g: 0, b: 0, a: 255 },
                            antialias: false,
                            shadows: false,
                        },
                        pixelSettings: {
                            targetSize: { width: 32, height: 32 },
                            pixelScale: 2,
                            dithering: false,
                            ditheringStrength: 0,
                            contrastBoost: 0,
                            brightnessAdjust: 0,
                        },
                    });
                }
            }

            PresetFactory.register('custom', CustomPreset);
            const preset = PresetFactory.create('custom');
            expect(preset).toBeInstanceOf(CustomPreset);
        });
    });

    describe('getAvailablePresets', () => {
        it('should return all available presets', () => {
            const presets = PresetFactory.getAvailablePresets();
            expect(presets).toContain('pokemon');
            expect(presets).toContain('final-fantasy');
            expect(presets).toContain('chrono-trigger');
            expect(presets).toContain('zelda-alttp');
        });
    });

    describe('createAll', () => {
        it('should create instances of all presets', () => {
            const presets = PresetFactory.createAll();
            expect(presets.size).toBeGreaterThanOrEqual(4);
            expect(presets.get('pokemon')).toBeInstanceOf(PokemonPreset);
            expect(presets.get('final-fantasy')).toBeInstanceOf(FFPreset);
        });
    });
});