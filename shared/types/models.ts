// shared/types/models.ts
import {Color} from "@shared/types/rendering.ts";

export interface Vector3 {
    x: number;
    y: number;
    z: number;
}

export interface Quaternion {
    x: number;
    y: number;
    z: number;
    w: number;
}

export interface BoundingBox {
    min: Vector3;
    max: Vector3;
    center: Vector3;
    size: Vector3;
}

export interface Mesh {
    id: string;
    name: string;
    vertices: Float32Array;
    normals: Float32Array;
    uvs: Float32Array;
    indices: Uint16Array | Uint32Array;
    materialId?: string;
}

export interface Material {
    id: string;
    name: string;
    color: Color;
    texture?: Texture;
    opacity: number;
    metalness?: number;
    roughness?: number;
}

export interface Texture {
    id: string;
    url: string;
    width: number;
    height: number;
}

export interface AnimationKeyframe {
    time: number;
    value: Vector3 | Quaternion | number;
}

export interface AnimationChannel {
    targetId: string;
    property: 'position' | 'rotation' | 'scale';
    keyframes: AnimationKeyframe[];
}

export interface Animation {
    id: string;
    name: string;
    duration: number;
    channels: AnimationChannel[];
}

export interface ModelMetadata {
    format: string;
    version?: string;
    generator?: string;
    created?: Date;
    modified?: Date;
}

export interface Model3D {
    id: string;
    meshes: Mesh[];
    materials: Material[];
    animations: Animation[];
    bounds: BoundingBox;
    metadata: ModelMetadata;
}

export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
}

export interface ValidationError {
    code: string;
    message: string;
    field?: string;
}

export interface ValidationWarning {
    code: string;
    message: string;
    field?: string;
}








