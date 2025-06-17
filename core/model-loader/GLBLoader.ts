// core/model-loader/GLBLoader.ts - Version améliorée pour textures et animations

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
    private textureCache = new Map<string, string>();

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

    private convertGLTFToModel(gltf: GLTF, _filename: string): Model3D {
        const modelId = generateId('model');
        const meshes: Mesh[] = [];
        const materials: Material[] = [];
        const animations: Animation[] = [];
        const textures = new Map<THREE.Texture, Texture>();
        const materialMap = new Map<THREE.Material, string>();

        // AMÉLIORATION: Extraire toutes les textures embedées
        gltf.scene.traverse((node: THREE.Object3D) => {
            if (node instanceof THREE.Mesh) {
                const processMaterial = (mat: THREE.Material) => {
                    if (mat instanceof THREE.MeshStandardMaterial ||
                        mat instanceof THREE.MeshBasicMaterial ||
                        mat instanceof THREE.MeshPhysicalMaterial) {

                        // Traiter la texture principale
                        if (mat.map && !textures.has(mat.map)) {
                            const textureId = generateId('texture');
                            const textureData = this.extractTextureData(mat.map);

                            if (textureData) {
                                const texture: Texture = {
                                    id: textureId,
                                    url: textureData,
                                    width: mat.map.image?.width || 512,
                                    height: mat.map.image?.height || 512,
                                };
                                textures.set(mat.map, texture);
                                console.log(`📸 Extracted embedded texture: ${texture.width}x${texture.height}`);
                            }
                        }

                        // Traiter les autres textures (normal, roughness, etc.)
                        ['normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap'].forEach(mapName => {
                            const map = (mat as any)[mapName];
                            if (map && !textures.has(map)) {
                                const textureData = this.extractTextureData(map);
                                if (textureData) {
                                    const texture: Texture = {
                                        id: generateId('texture'),
                                        url: textureData,
                                        width: map.image?.width || 512,
                                        height: map.image?.height || 512,
                                    };
                                    textures.set(map, texture);
                                }
                            }
                        });
                    }
                };

                // Gérer les matériaux (single ou array)
                if (Array.isArray(node.material)) {
                    node.material.forEach(processMaterial);
                } else {
                    processMaterial(node.material);
                }
            }
        });

        // Extraire les matériaux
        const processedMaterials = new Set<THREE.Material>();

        gltf.scene.traverse((node: THREE.Object3D) => {
            if (node instanceof THREE.Mesh) {
                const processMaterial = (threeMat: THREE.Material) => {
                    if (!processedMaterials.has(threeMat)) {
                        processedMaterials.add(threeMat);

                        const material = this.convertThreeMaterial(threeMat, textures);
                        materials.push(material);
                        materialMap.set(threeMat, material.id);
                    }
                };

                if (Array.isArray(node.material)) {
                    node.material.forEach(processMaterial);
                } else {
                    processMaterial(node.material);
                }
            }
        });

        // Extraire les meshes
        gltf.scene.traverse((node: THREE.Object3D) => {
            if (node instanceof THREE.Mesh) {
                const mesh = this.convertThreeMesh(node, materialMap);
                meshes.push(mesh);
            }
        });

        // AMÉLIORATION: Extraire les animations depuis GLTF
        if (gltf.animations && gltf.animations.length > 0) {
            console.log(`🎬 Found ${gltf.animations.length} animations in GLTF`);

            gltf.animations.forEach((clip: THREE.AnimationClip) => {
                const animation = this.convertThreeAnimation(clip, gltf.scene);
                animations.push(animation);
                console.log(`✅ Converted animation: ${animation.name} (${animation.duration}s)`);
            });
        }

        // Calculer les bounds
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

    private extractTextureData(texture: THREE.Texture): string | null {
        if (!texture.image) return null;

        try {
            // Si c'est déjà une data URL
            if (texture.image.src && texture.image.src.startsWith('data:')) {
                return texture.image.src;
            }

            // Créer un canvas pour extraire les données
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return null;

            canvas.width = texture.image.width || 512;
            canvas.height = texture.image.height || 512;

            if (texture.image instanceof HTMLCanvasElement) {
                ctx.drawImage(texture.image, 0, 0);
            } else if (texture.image instanceof HTMLImageElement) {
                ctx.drawImage(texture.image, 0, 0);
            } else if (texture.image instanceof ImageBitmap) {
                ctx.drawImage(texture.image, 0, 0);
            } else {
                console.warn('Unknown texture image type');
                return null;
            }

            // Convertir en data URL
            return canvas.toDataURL('image/png');
        } catch (error) {
            console.error('Failed to extract texture data:', error);
            return null;
        }
    }

    private convertThreeMesh(threeMesh: THREE.Mesh, materialMap: Map<THREE.Material, string>): Mesh {
        const geometry = threeMesh.geometry;
        const positions = geometry.attributes.position.array as Float32Array;
        const normals = geometry.attributes.normal?.array as Float32Array || new Float32Array(positions.length);
        const uvs = geometry.attributes.uv?.array as Float32Array || new Float32Array((positions.length / 3) * 2);
        const indices = geometry.index?.array || this.generateIndices(positions.length / 3);

        // Déterminer le material ID
        let materialId: string | undefined;
        if (Array.isArray(threeMesh.material)) {
            // Pour les multi-matériaux, prendre le premier
            materialId = materialMap.get(threeMesh.material[0]);
        } else {
            materialId = materialMap.get(threeMesh.material);
        }

        return {
            id: generateId('mesh'),
            name: threeMesh.name || 'Mesh',
            vertices: positions,
            normals,
            uvs,
            indices: indices instanceof Uint16Array || indices instanceof Uint32Array
                ? indices
                : new Uint32Array(indices),
            materialId,
        };
    }

    private convertThreeMaterial(
        threeMaterial: THREE.Material,
        textures: Map<THREE.Texture, Texture>
    ): Material {
        let color = { r: 128, g: 128, b: 128, a: 255 };
        let texture: Texture | undefined;
        let metalness = 0;
        let roughness = 1;
        let opacity = 1;

        if (threeMaterial instanceof THREE.MeshStandardMaterial ||
            threeMaterial instanceof THREE.MeshPhysicalMaterial) {
            color = {
                r: threeMaterial.color.r * 255,
                g: threeMaterial.color.g * 255,
                b: threeMaterial.color.b * 255,
                a: threeMaterial.opacity * 255,
            };
            texture = threeMaterial.map ? textures.get(threeMaterial.map) : undefined;
            metalness = threeMaterial.metalness;
            roughness = threeMaterial.roughness;
            opacity = threeMaterial.opacity;
        } else if (threeMaterial instanceof THREE.MeshBasicMaterial) {
            color = {
                r: threeMaterial.color.r * 255,
                g: threeMaterial.color.g * 255,
                b: threeMaterial.color.b * 255,
                a: threeMaterial.opacity * 255,
            };
            texture = threeMaterial.map ? textures.get(threeMaterial.map) : undefined;
            opacity = threeMaterial.opacity;
        }

        return {
            id: threeMaterial.uuid,
            name: threeMaterial.name || 'Material',
            color,
            texture,
            opacity,
            metalness,
            roughness,
        };
    }

    private convertThreeAnimation(clip: THREE.AnimationClip, scene: THREE.Object3D): Animation {
        const channels: AnimationChannel[] = [];

        clip.tracks.forEach((track: THREE.KeyframeTrack) => {
            const [objectName, property] = this.parseTrackName(track.name);

            // Trouver l'objet cible dans la scène
            const target = scene.getObjectByName(objectName);
            const targetId = target ? target.uuid : objectName;

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
        const objectName = parts.slice(0, -1).join('.');
        const property = parts[parts.length - 1].toLowerCase();

        if (property.includes('position')) return [objectName, 'position'];
        if (property.includes('quaternion') || property.includes('rotation')) return [objectName, 'rotation'];
        if (property.includes('scale')) return [objectName, 'scale'];

        return [objectName, 'position'];
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
        this.textureCache.clear();
    }
}