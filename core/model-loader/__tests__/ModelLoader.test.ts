// core/model-loader/__tests__/ModelLoader.test.ts
import { ModelLoader } from '../ModelLoader';
import { Model3D, ValidationResult } from '@shared/types/models';
import { ModelValidator } from '@shared/utils';

// Mock implementation for testing
class MockModelLoader extends ModelLoader {
    constructor() {
        super('Mock');
    }

    async loadModel(file: File): Promise<Model3D> {
        return {
            id: 'test-model',
            meshes: [{
                id: 'test-mesh',
                name: 'TestMesh',
                vertices: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
                normals: new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]),
                uvs: new Float32Array([0, 0, 1, 0, 0, 1]),
                indices: new Uint16Array([0, 1, 2]),
            }],
            materials: [],
            animations: [],
            bounds: {
                min: { x: 0, y: 0, z: 0 },
                max: { x: 1, y: 1, z: 0 },
                center: { x: 0.5, y: 0.5, z: 0 },
                size: { x: 1, y: 1, z: 0 },
            },
            metadata: {
                format: 'mock',
                created: new Date(),
            },
        };
    }

    getSupportedFormats(): string[] {
        return ['.mock'];
    }
}

describe('ModelLoader', () => {
    let loader: MockModelLoader;

    beforeEach(() => {
        loader = new MockModelLoader();
    });

    afterEach(() => {
        loader.dispose();
    });

    describe('validateModel', () => {
        it('should validate a valid model', async () => {
            const file = new File([''], 'test.mock');
            const model = await loader.loadModel(file);
            const result = loader.validateModel(model);

            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should detect invalid model with no meshes', () => {
            const invalidModel: Model3D = {
                id: 'invalid',
                meshes: [],
                materials: [],
                animations: [],
                bounds: {
                    min: { x: 0, y: 0, z: 0 },
                    max: { x: 0, y: 0, z: 0 },
                    center: { x: 0, y: 0, z: 0 },
                    size: { x: 0, y: 0, z: 0 },
                },
                metadata: {
                    format: 'mock',
                    created: new Date(),
                },
            };

            const result = loader.validateModel(invalidModel);
            expect(result.valid).toBe(false);
            expect(result.errors).toContainEqual(
                expect.objectContaining({
                    code: 'NO_MESHES',
                })
            );
        });
    });

    describe('readFileAsArrayBuffer', () => {
        it('should read file as array buffer', async () => {
            const content = 'test content';
            const file = new File([content], 'test.mock');

            // Access protected method through any type assertion
            const buffer = await (loader as any).readFileAsArrayBuffer(file);

            expect(buffer).toBeInstanceOf(ArrayBuffer);
            expect(buffer.byteLength).toBe(content.length);
        });
    });
});