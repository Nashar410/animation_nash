// core/model-loader/__tests__/GLBLoader.test.ts
import { GLBLoader } from '../GLBLoader';
import * as THREE from 'three';

// Mock Three.js
jest.mock('three', () => ({
    ...jest.requireActual('three'),
    Box3: jest.fn().mockImplementation(() => ({
        setFromObject: jest.fn().mockReturnThis(),
        min: new (jest.requireActual('three')).Vector3(0, 0, 0),
        max: new (jest.requireActual('three')).Vector3(1, 1, 1),
    })),
}));

jest.mock('three/examples/jsm/loaders/GLTFLoader', () => ({
    GLTFLoader: jest.fn().mockImplementation(() => ({
        parse: jest.fn((_buffer, _path, onLoad, _onError) => {
            // Simulate successful GLTF loading
            const mockScene = new THREE.Scene();
            const mockMesh = new THREE.Mesh(
                new THREE.BoxGeometry(1, 1, 1),
                new THREE.MeshStandardMaterial({ color: 0xffffff })
            );
            mockScene.add(mockMesh);

            onLoad({
                scene: mockScene,
                animations: [],
                asset: { version: '2.0', generator: 'Mock' },
            });
        }),
    })),
}));

describe('GLBLoader', () => {
    let loader: GLBLoader;

    beforeEach(() => {
        loader = new GLBLoader();
    });

    afterEach(() => {
        loader.dispose();
    });

    describe('getSupportedFormats', () => {
        it('should return supported formats', () => {
            const formats = loader.getSupportedFormats();
            expect(formats).toContain('.glb');
            expect(formats).toContain('.gltf');
        });
    });

    describe('loadModel', () => {
        it('should load a valid GLB file', async () => {
            const mockGLBContent = new ArrayBuffer(100);
            const file = new File([mockGLBContent], 'test.glb', {type: 'model/gltf-binary'});

            const model = await loader.loadModel(file);

            expect(model).toBeDefined();
            expect(model.id).toBeTruthy();
            expect(model.meshes.length).toBeGreaterThan(0);
            expect(model.metadata.format).toBe('GLTF');
        });

        it('should handle invalid file', async () => {
            const file = new File(['invalid content'], 'test.glb');

            // Mock parse to fail
            const mockParse = jest.fn((_buffer, _path, _onLoad, onError) => {
                onError(new Error('Invalid GLB file'));
            });

            (loader as any).loader.parse = mockParse;

            await expect(loader.loadModel(file)).rejects.toThrow();
        });
    });
});