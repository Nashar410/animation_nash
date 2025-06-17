// rendering/three-renderer/managers/ModelManager.ts
import * as THREE from 'three';
import { Model3D } from '@shared/types';
import { Logger } from '@shared/utils/logger';

export class ModelManager {
    public currentModel: THREE.Group | null = null;
    private scene: THREE.Scene;
    private logger: Logger;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.logger = new Logger('ModelManager');
    }

    public load(modelData: Model3D): void {
        this.disposeCurrent();

        const modelGroup = new THREE.Group();
        modelGroup.userData.modelId = modelData.id;

        const materials = this.createMaterials(modelData.materials);

        modelData.meshes.forEach(meshData => {
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(meshData.vertices, 3));
            geometry.setAttribute('uv', new THREE.BufferAttribute(meshData.uvs, 2));

            if (meshData.normals && meshData.normals.length > 0) {
                geometry.setAttribute('normal', new THREE.BufferAttribute(meshData.normals, 3));
            } else {
                geometry.computeVertexNormals();
            }

            if (meshData.indices) geometry.setIndex(new THREE.BufferAttribute(meshData.indices, 1));

            const material = meshData.materialId ? materials.get(meshData.materialId) : new THREE.MeshStandardMaterial({ color: 0x888888 });
            const threeMesh = new THREE.Mesh(geometry, material);
            threeMesh.name = meshData.name;
            modelGroup.add(threeMesh);
        });

        this.centerAndScale(modelGroup);

        this.currentModel = modelGroup;
        this.scene.add(this.currentModel);
        this.logger.info(`Model ${modelData.id} loaded.`);
    }

    private createMaterials(materialsData: Model3D['materials']): Map<string, THREE.Material> {
        const materials = new Map<string, THREE.Material>();
        const textureLoader = new THREE.TextureLoader();
        materialsData.forEach(mat => {
            const material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(mat.color.r / 255, mat.color.g / 255, mat.color.b / 255),
                metalness: mat.metalness || 0,
                roughness: mat.roughness || 0.8,
            });
            if (mat.texture?.url) {
                textureLoader.load(mat.texture.url, (texture) => {
                    material.map = texture;
                    material.needsUpdate = true;
                });
            }
            materials.set(mat.id, material);
        });
        return materials;
    }

    private centerAndScale(modelGroup: THREE.Group): void {
        const box = new THREE.Box3().setFromObject(modelGroup);
        const center = box.getCenter(new THREE.Vector3());
        modelGroup.position.sub(center);

        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 0) {
            const scale = 8 / maxDim;
            modelGroup.scale.setScalar(scale);
        }
    }

    public disposeCurrent(): void {
        if (this.currentModel) {
            this.scene.remove(this.currentModel);
            this.currentModel.traverse(obj => {
                if (obj instanceof THREE.Mesh) {
                    obj.geometry.dispose();
                    if (Array.isArray(obj.material)) {
                        obj.material.forEach(m => m.dispose());
                    } else {
                        obj.material.dispose();
                    }
                }
            });
            this.currentModel = null;
            this.logger.info('Previous model disposed.');
        }
    }
}
