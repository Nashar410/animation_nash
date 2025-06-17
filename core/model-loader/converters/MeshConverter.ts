// core/model-loader/converters/MeshConverter.ts
import * as THREE from 'three';
import { Mesh } from '@shared/types';
import { ModelLoader } from '../ModelLoader';

export class MeshConverter {
    public static convert(threeMesh: THREE.Mesh, materialMap: Map<THREE.Material, string>): Mesh {
        const geometry = threeMesh.geometry;
        const positions = geometry.attributes.position.array as Float32Array;
        const normals = geometry.attributes.normal?.array as Float32Array || new Float32Array(positions.length);
        const uvs = geometry.attributes.uv?.array as Float32Array || new Float32Array((positions.length / 3) * 2);
        const indices = geometry.index?.array || this.generateIndices(positions.length / 3);

        let materialId: string | undefined;
        if (Array.isArray(threeMesh.material)) {
            materialId = materialMap.get(threeMesh.material[0]);
        } else {
            materialId = materialMap.get(threeMesh.material);
        }

        return {
            id: ModelLoader.generateId('mesh'),
            name: threeMesh.name || 'Mesh',
            vertices: positions,
            normals,
            uvs,
            indices: indices instanceof Uint16Array || indices instanceof Uint32Array ? indices : new Uint32Array(indices),
            materialId,
        };
    }

    private static generateIndices(vertexCount: number): Uint32Array {
        const indices = new Uint32Array(vertexCount);
        for (let i = 0; i < vertexCount; i++) {
            indices[i] = i;
        }
        return indices;
    }
}
