// shared/types/rendering.ts
import {Quaternion, Vector3} from "@shared/types/models.ts";

export interface Color {
    r: number; // 0-255
    g: number; // 0-255
    b: number; // 0-255
    a: number; // 0-255
}

export interface Size {
    width: number;
    height: number;
}

export interface Camera {
    position: Vector3;
    rotation: Quaternion;
    fov: number;
    near: number;
    far: number;
    type: 'perspective' | 'orthographic';
    orthographicSize?: number;
}

export interface Light {
    type: 'directional' | 'ambient' | 'point';
    color: Color;
    intensity: number;
    position?: Vector3;
    direction?: Vector3;
}

export interface RenderSettings {
    camera: Camera;
    lights: Light[];
    backgroundColor: Color;
    antialias: boolean;
    shadows: boolean;
}

export interface RenderResult {
    image: ImageData;
    renderTime: number;
    frameNumber: number;
}