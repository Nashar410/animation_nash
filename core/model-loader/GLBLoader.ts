// core/model-loader/GLBLoader.ts (Refactored and Corrected)
import * as THREE from 'three';
import { ModelLoader } from './ModelLoader';
import { Model3D, Texture } from '@shared/types/models';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
    TextureConverter, MaterialConverter, MeshConverter,
    AnimationConverter, BoundingBoxConverter
} from './converters';

export class GLBLoader extends ModelLoader {
    private loader: GLTFLoader = new GLTFLoader();

    constructor() {
        super('GLB');
    }

    public getSupportedFormats(): string[] {
        return ['.glb', '.gltf'];
    }

    public async loadModel(file: File): Promise<Model3D> {
        this.logger.info('Loading GLB/GLTF file', { name: file.name });
        try {
            const arrayBuffer = await this.readFileAsArrayBuffer(file);
            const gltf = await this.parseGLTF(arrayBuffer);
            const model = this.convertGLTFToModel3D(gltf);

            const validation = this.validateModel(model);
            if (!validation.valid) {
                const errorMsg = 'Invalid model: ' + (validation.errors[0]?.message || 'Unknown validation error');
                this.logger.error('Model validation failed', validation.errors);
                throw new Error(errorMsg);
            }
            return model;
        } catch (error) {
            this.logger.error('Failed to load GLB file', error);
            throw error;
        }
    }

    private parseGLTF(buffer: ArrayBuffer): Promise<GLTF> {
        return new Promise((resolve, reject) => {
            this.loader.parse(buffer, '', resolve, reject);
        });
    }

    private convertGLTFToModel3D(gltf: GLTF): Model3D {
        const { scene, animations: gltfAnimations, asset } = gltf;

        const textures = new Map<THREE.Texture, Texture>();
        scene.traverse(node => {
            if (node instanceof THREE.Mesh) {
                const materials = Array.isArray(node.material) ? node.material : [node.material];
                materials.forEach(mat => {
                    if (mat instanceof THREE.MeshStandardMaterial && mat.map && !textures.has(mat.map)) {
                        const extractedTexture = TextureConverter.extract(mat.map);
                        if (extractedTexture) textures.set(mat.map, extractedTexture);
                    }
                });
            }
        });

        const materials: Model3D['materials'] = [];
        const materialMap = new Map<THREE.Material, string>();
        const processedMaterials = new Set<THREE.Material>();
        scene.traverse(node => {
            if (node instanceof THREE.Mesh) {
                const threeMats = Array.isArray(node.material) ? node.material : [node.material];
                threeMats.forEach(threeMat => {
                    if (!processedMaterials.has(threeMat)) {
                        const convertedMat = MaterialConverter.convert(threeMat, textures);
                        materials.push(convertedMat);
                        materialMap.set(threeMat, convertedMat.id);
                        processedMaterials.add(threeMat);
                    }
                });
            }
        });

        const meshes: Model3D['meshes'] = [];
        scene.traverse(node => {
            if (node instanceof THREE.Mesh) {
                meshes.push(MeshConverter.convert(node, materialMap));
            }
        });

        const animations: Model3D['animations'] = gltfAnimations.map(clip =>
            AnimationConverter.convert(clip, scene)
        );

        return {
            id: ModelLoader.generateId('model'), // Utilisation de la méthode statique
            meshes,
            materials,
            animations,
            bounds: BoundingBoxConverter.calculateFrom(scene),
            metadata: {
                format: 'GLTF',
                version: '2.0',
                generator: asset?.generator,
                created: new Date(),
            },
        };
    }
}
