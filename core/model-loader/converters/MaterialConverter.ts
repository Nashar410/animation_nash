// core/model-loader/converters/MaterialConverter.ts
import * as THREE from 'three';
import { Material, Texture } from '@shared/types';

export class MaterialConverter {
    public static convert(threeMaterial: THREE.Material, textures: Map<THREE.Texture, Texture>): Material {
        let color = { r: 128, g: 128, b: 128, a: 255 };
        let texture: Texture | undefined;
        let metalness = 0;
        let roughness = 1;
        let opacity = 1;

        if (threeMaterial instanceof THREE.MeshStandardMaterial || threeMaterial instanceof THREE.MeshPhysicalMaterial) {
            color = {
                r: threeMaterial.color.r * 255, g: threeMaterial.color.g * 255, b: threeMaterial.color.b * 255, a: threeMaterial.opacity * 255,
            };
            texture = threeMaterial.map ? textures.get(threeMaterial.map) : undefined;
            metalness = threeMaterial.metalness;
            roughness = threeMaterial.roughness;
            opacity = threeMaterial.opacity;
        } else if (threeMaterial instanceof THREE.MeshBasicMaterial) {
            color = {
                r: threeMaterial.color.r * 255, g: threeMaterial.color.g * 255, b: threeMaterial.color.b * 255, a: threeMaterial.opacity * 255,
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
}
