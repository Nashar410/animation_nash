// core/model-loader/converters/BoundingBoxConverter.ts
import * as THREE from 'three';
import { BoundingBox } from '@shared/types';

export class BoundingBoxConverter {
    public static calculateFrom(sceneGroup: THREE.Group): BoundingBox {
        const box = new THREE.Box3().setFromObject(sceneGroup);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        return {
            min: { x: box.min.x, y: box.min.y, z: box.min.z },
            max: { x: box.max.x, y: box.max.y, z: box.max.z },
            center: { x: center.x, y: center.y, z: center.z },
            size: { x: size.x, y: size.y, z: size.z },
        };
    }
}
