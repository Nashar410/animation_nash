// core/model-loader/GLBLoader.ts - Version finale corrigée

import * as THREE from 'three';
import { ModelLoader } from './ModelLoader';
import {
    Model3D,
    Mesh,
    Material,
    Animation,
    AnimationChannel,
    AnimationKeyframe,
    BoundingBox,
    Vector3,
    Quaternion,
    Texture
} from '@shared/types/models';
import { generateId } from "@shared/utils/id.ts";
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class GLBLoader extends ModelLoader {
    private loader: GLTFLoader;

    constructor() {
        super('GLB');
        this.loader = new GLTFLoader();
    }

    getSupportedFormats(): string[] {
        return ['.glb', '.gltf'];
    }

    async loadModel(file: File): Promise<Model3D> {
        this.logger.info('Loading GLB/GLTF file', { name: file.name, size: file.size });

        try {
            const arrayBuffer = await this.readFileAsArrayBuffer(file);
            const gltf = await this.loadGLTF(arrayBuffer);

            const model = this.convertGLTFToModel(gltf, file.name);

            const validation = this.validateModel(model);
            if (!validation.valid) {
                this.logger.error('Model validation failed', validation.errors);
                throw new Error('Invalid model: ' + validation.errors[0].message);
            }

            return model;
        } catch (error) {
            this.logger.error('Failed to load GLB file', error);
            throw error;
        }
    }

    // CORRECTION: Utiliser l'interface GLTF officielle
    private loadGLTF(buffer: ArrayBuffer): Promise<GLTF> {
        return new Promise((resolve, reject) => {
            this.loader.parse(
                buffer,
                '',
                (gltf: GLTF) => resolve(gltf),
                (error: ErrorEvent) => reject(error)
            );
        });
    }

    // CORRECTION: Paramètre gltf typé comme GLTF
    private convertGLTFToModel(gltf: GLTF, _filename: string): Model3D {
        const modelId = generateId('model');
        const meshes: Mesh[] = [];
        const materials: Material[] = [];
        const animations: Animation[] = [];
        const textures = new Map<THREE.Texture, Texture>();

        // Extract textures - gltf.scene est maintenant correctement typé
        gltf.scene.traverse((node: THREE.Object3D) => {
            if (node instanceof THREE.Mesh) {
                const material = node.material as THREE.MeshStandardMaterial;
                if (material.map && !textures.has(material.map)) {
                    const texture: Texture = {
                        id: generateId('texture'),
                        url: material.map.source.data?.src || '',
                        width: material.map.image?.width || 0,
                        height: material.map.image?.height || 0,
                    };
                    textures.set(material.map, texture);
                }
            }
        });

        // Extract meshes and materials
        gltf.scene.traverse((node: THREE.Object3D) => {
            if (node instanceof THREE.Mesh) {
                const mesh = this.convertThreeMesh(node);
                meshes.push(mesh);

                const material = this.convertThreeMaterial(
                    node.material as THREE.MeshStandardMaterial,
                    textures
                );
                if (material && !materials.find(m => m.id === material.id)) {
                    materials.push(material);
                }
            }
        });

        // Extract animations
        if (gltf.animations && gltf.animations.length > 0) {
            gltf.animations.forEach((clip: THREE.AnimationClip) => {
                const animation = this.convertThreeAnimation(clip);
                animations.push(animation);
            });
        }

        // Calculate bounds
        const bounds = this.calculateBounds(gltf.scene);

        return {
            id: modelId,
            meshes,
            materials,
            animations,
            bounds,
            metadata: {
                format: 'GLTF',
                version: '2.0',
                generator: gltf.asset?.generator,
                created: new Date(),
            },
        };
    }

    private convertThreeMesh(threeMesh: THREE.Mesh): Mesh {
        const geometry = threeMesh.geometry;
        const positions = geometry.attributes.position.array as Float32Array;
        const normals = geometry.attributes.normal?.array as Float32Array || new Float32Array(positions.length);
        const uvs = geometry.attributes.uv?.array as Float32Array || new Float32Array((positions.length / 3) * 2);
        const indices = geometry.index?.array || this.generateIndices(positions.length / 3);

        return {
            id: generateId('mesh'),
            name: threeMesh.name || 'Mesh',
            vertices: positions,
            normals,
            uvs,
            indices: indices instanceof Uint16Array || indices instanceof Uint32Array
                ? indices
                : new Uint32Array(indices),
            // CORRECTION: Cast correct vers MeshStandardMaterial
            materialId: (threeMesh.material as THREE.MeshStandardMaterial).uuid,
        };
    }

    private convertThreeMaterial(
        threeMaterial: THREE.MeshStandardMaterial,
        textures: Map<THREE.Texture, Texture>
    ): Material {
        return {
            id: threeMaterial.uuid,
            name: threeMaterial.name || 'Material',
            color: {
                r: threeMaterial.color.r * 255,
                g: threeMaterial.color.g * 255,
                b: threeMaterial.color.b * 255,
                a: threeMaterial.opacity * 255,
            },
            texture: threeMaterial.map ? textures.get(threeMaterial.map) : undefined,
            opacity: threeMaterial.opacity,
            metalness: threeMaterial.metalness,
            roughness: threeMaterial.roughness,
        };
    }

    private convertThreeAnimation(clip: THREE.AnimationClip): Animation {
        const channels: AnimationChannel[] = [];

        clip.tracks.forEach((track: THREE.KeyframeTrack) => {
            const [targetId, property] = this.parseTrackName(track.name);

            if (property === 'position' || property === 'rotation' || property === 'scale') {
                const keyframes: AnimationKeyframe[] = [];

                for (let i = 0; i < track.times.length; i++) {
                    const time = track.times[i];
                    const value = this.extractKeyframeValue(track, i, property);

                    keyframes.push({ time, value });
                }

                channels.push({
                    targetId,
                    property,
                    keyframes,
                });
            }
        });

        return {
            id: generateId('animation'),
            name: clip.name || 'Animation',
            duration: clip.duration,
            channels,
        };
    }

    private parseTrackName(name: string): [string, 'position' | 'rotation' | 'scale'] {
        const parts = name.split('.');
        const targetId = parts[0];
        const property = parts[parts.length - 1].toLowerCase();

        if (property.includes('position')) return [targetId, 'position'];
        if (property.includes('quaternion') || property.includes('rotation')) return [targetId, 'rotation'];
        if (property.includes('scale')) return [targetId, 'scale'];

        return [targetId, 'position'];
    }

    private extractKeyframeValue(
        track: THREE.KeyframeTrack,
        index: number,
        property: string
    ): Vector3 | Quaternion | number {
        const values = track.values;
        const stride = track.getValueSize();
        const offset = index * stride;

        if (property === 'rotation' && stride === 4) {
            return {
                x: values[offset],
                y: values[offset + 1],
                z: values[offset + 2],
                w: values[offset + 3],
            } as Quaternion;
        } else if (stride === 3) {
            return {
                x: values[offset],
                y: values[offset + 1],
                z: values[offset + 2],
            } as Vector3;
        } else {
            return values[offset];
        }
    }

    // CORRECTION: Paramètre typé comme Group (pas Scene)
    private calculateBounds(sceneGroup: THREE.Group): BoundingBox {
        const box = new THREE.Box3().setFromObject(sceneGroup);

        return {
            min: {
                x: box.min.x,
                y: box.min.y,
                z: box.min.z,
            },
            max: {
                x: box.max.x,
                y: box.max.y,
                z: box.max.z,
            },
            center: {
                x: (box.min.x + box.max.x) / 2,
                y: (box.min.y + box.max.y) / 2,
                z: (box.min.z + box.max.z) / 2,
            },
            size: {
                x: box.max.x - box.min.x,
                y: box.max.y - box.min.y,
                z: box.max.z - box.min.z,
            },
        };
    }

    private generateIndices(vertexCount: number): Uint32Array {
        const indices = new Uint32Array(vertexCount);
        for (let i = 0; i < vertexCount; i++) {
            indices[i] = i;
        }
        return indices;
    }

    dispose(): void {
        super.dispose();
        // Three.js loader doesn't need explicit disposal
    }
}
