
// core/model-loader/__tests__/ModelLoaderFactory.test.ts
import { ModelLoaderFactory } from '../ModelLoaderFactory';
import { GLBLoader } from '../GLBLoader';

describe('ModelLoaderFactory', () => {
    describe('create', () => {
        it('should create GLBLoader for .glb files', () => {
            const loader = ModelLoaderFactory.create('model.glb');
            expect(loader).toBeInstanceOf(GLBLoader);
        });

        it('should create GLBLoader for .gltf files', () => {
            const loader = ModelLoaderFactory.create('model.gltf');
            expect(loader).toBeInstanceOf(GLBLoader);
        });

        it('should throw error for unsupported format', () => {
            expect(() => ModelLoaderFactory.create('model.xyz')).toThrow('Unsupported format');
        });

        it('should be case insensitive', () => {
            const loader = ModelLoaderFactory.create('model.GLB');
            expect(loader).toBeInstanceOf(GLBLoader);
        });
    });

    describe('getSupportedFormats', () => {
        it('should return all supported formats', () => {
            const formats = ModelLoaderFactory.getSupportedFormats();
            expect(formats).toContain('.glb');
            expect(formats).toContain('.gltf');
        });
    });
});
