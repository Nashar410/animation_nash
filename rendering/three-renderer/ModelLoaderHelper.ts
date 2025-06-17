// rendering/three-renderer/ModelLoaderHelper.ts (Corrected)
import * as THREE from 'three';
import { Model3D } from '@shared/types';

export class ModelLoaderHelper {
    public static createThreeGroup(model: Model3D): THREE.Group {
        const modelGroup = new THREE.Group();
        modelGroup.userData.isModel = true;

        const materials = new Map<string, THREE.Material>();
        model.materials.forEach(mat => {
            const material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(mat.color.r / 255, mat.color.g / 255, mat.color.b / 255),
                metalness: mat.metalness || 0.1,
                roughness: mat.roughness || 0.8,
                side: THREE.DoubleSide,
            });
            materials.set(mat.id, material);
        });

        let meshCount = 0;
        model.meshes.forEach(mesh => {
            try {
                const geometry = new THREE.BufferGeometry();
                if (mesh.vertices && mesh.vertices.length > 0) {
                    geometry.setAttribute('position', new THREE.BufferAttribute(mesh.vertices, 3));

                    // Corrected normals logic
                    if (mesh.normals && mesh.normals.length > 0) {
                        geometry.setAttribute('normal', new THREE.BufferAttribute(mesh.normals, 3));
                    } else {
                        geometry.computeVertexNormals();
                    }

                    if (mesh.uvs && mesh.uvs.length > 0) geometry.setAttribute('uv', new THREE.BufferAttribute(mesh.uvs, 2));
                    if (mesh.indices && mesh.indices.length > 0) geometry.setIndex(new THREE.BufferAttribute(mesh.indices, 1));

                    const material = mesh.materialId && materials.has(mesh.materialId) ? materials.get(mesh.materialId)! : new THREE.MeshStandardMaterial({ color: 0x888888 });
                    const threeMesh = new THREE.Mesh(geometry, material);
                    threeMesh.name = mesh.name;
                    threeMesh.castShadow = true;
                    threeMesh.receiveShadow = true;
                    modelGroup.add(threeMesh);
                    meshCount++;
                }
            } catch (error) {
                console.warn(`⚠️ Failed to create mesh ${mesh.name}:`, error);
            }
        });

        if (meshCount > 0) {
            const box = new THREE.Box3().setFromObject(modelGroup);
            const center = box.getCenter(new THREE.Vector3());
            modelGroup.position.sub(center);

            const size = box.getSize(new THREE.Vector3());
            const maxDimension = Math.max(size.x, size.y, size.z);
            if (maxDimension > 10) {
                const scale = 8 / maxDimension;
                modelGroup.scale.setScalar(scale);
            }
        }
        return modelGroup;
    }
}
