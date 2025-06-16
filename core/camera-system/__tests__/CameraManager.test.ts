// core/camera-system/__tests__/CameraManager.test.ts
import { CameraManager } from '../CameraManager';
import { Camera } from '@shared/types';
import { EventBus } from '@shared/events';
import { PokemonPreset } from '../presets/PokemonPreset';

describe('CameraManager', () => {
    let cameraManager: CameraManager;
    let eventBus: EventBus;
    let initialCamera: Camera;

    beforeEach(() => {
        eventBus = new EventBus();
        initialCamera = {
            position: { x: 0, y: 0, z: 10 },
            rotation: { x: 0, y: 0, z: 0, w: 1 },
            fov: 60,
            near: 0.1,
            far: 1000,
            type: 'perspective',
        };
        cameraManager = new CameraManager(initialCamera, eventBus);
    });

    describe('getCamera', () => {
        it('should return a copy of the current camera', () => {
            const camera = cameraManager.getCamera();
            expect(camera).toEqual(initialCamera);
            expect(camera).not.toBe(initialCamera);
        });
    });

    describe('setCamera', () => {
        it('should update camera instantly without transition', () => {
            const newCamera: Camera = {
                ...initialCamera,
                position: { x: 5, y: 5, z: 5 },
            };

            cameraManager.setCamera(newCamera);
            expect(cameraManager.getCamera()).toEqual(newCamera);
        });

        it('should start transition when duration is provided', () => {
            const newCamera: Camera = {
                ...initialCamera,
                position: { x: 5, y: 5, z: 5 },
            };

            cameraManager.setCamera(newCamera, 1000);
            const camera = cameraManager.getCamera();

            // Camera should still be at initial position
            expect(camera.position).toEqual(initialCamera.position);
        });
    });

    describe('registerPreset', () => {
        it('should register a preset', () => {
            const preset = new PokemonPreset();
            cameraManager.registerPreset('test', preset);

            const presets = cameraManager.getPresets();
            expect(presets.has('test')).toBe(true);
        });
    });

    describe('applyPreset', () => {
        it('should apply a registered preset', () => {
            const preset = new PokemonPreset();
            cameraManager.registerPreset('pokemon', preset);

            let presetChanged = false;
            eventBus.on('preset:changed', () => {
                presetChanged = true;
            });

            cameraManager.applyPreset('pokemon');

            const camera = cameraManager.getCamera();
            const presetCamera = preset.applyToCamera(initialCamera);
            expect(camera).toEqual(presetCamera);
            expect(presetChanged).toBe(true);
            expect(cameraManager.getCurrentPresetId()).toBe('pokemon');
        });

        it('should log error for unknown preset', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            cameraManager.applyPreset('unknown');
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Preset not found'));
            consoleSpy.mockRestore();
        });
    });

    describe('update', () => {
        it('should update camera position during transition', () => {
            const newCamera: Camera = {
                ...initialCamera,
                position: { x: 10, y: 0, z: 10 },
            };

            cameraManager.setCamera(newCamera, 1000); // 1 second transition
            cameraManager.update(500); // Half way through

            const camera = cameraManager.getCamera();
            expect(camera.position.x).toBeGreaterThan(0);
            expect(camera.position.x).toBeLessThan(10);
        });

        it('should complete transition after duration', () => {
            const newCamera: Camera = {
                ...initialCamera,
                position: { x: 10, y: 10, z: 10 },
            };

            cameraManager.setCamera(newCamera, 1000);
            cameraManager.update(1100); // Past duration

            const camera = cameraManager.getCamera();
            expect(camera.position).toEqual(newCamera.position);
        });
    });
});