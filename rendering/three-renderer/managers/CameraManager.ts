// rendering/three-renderer/managers/CameraManager.ts
import * as THREE from 'three';
import { Camera as CameraData } from '@shared/types';

export class CameraManager {
    public instance: THREE.PerspectiveCamera | THREE.OrthographicCamera;
    private canvas: HTMLCanvasElement;

    constructor(canvas: HTMLCanvasElement, initialData: CameraData) {
        this.canvas = canvas;
        this.instance = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
        this.update(initialData);
    }

    public update(data: CameraData): void {
        const aspect = this.canvas.width / this.canvas.height;

        if (data.type === 'perspective') {
            if (!(this.instance instanceof THREE.PerspectiveCamera)) {
                this.instance = new THREE.PerspectiveCamera(data.fov, aspect, data.near, data.far);
            }
            this.instance.fov = data.fov;
            this.instance.near = Math.max(0.01, data.near);
            this.instance.far = Math.min(10000, data.far);
        } else { // orthographic
            const size = data.orthographicSize || 10;
            if (!(this.instance instanceof THREE.OrthographicCamera)) {
                this.instance = new THREE.OrthographicCamera(-size * aspect / 2, size * aspect / 2, size / 2, -size / 2, data.near, data.far);
            }
            this.instance.left = -size * aspect / 2;
            this.instance.right = size * aspect / 2;
            this.instance.top = size / 2;
            this.instance.bottom = -size / 2;
            this.instance.near = Math.max(0.01, data.near);
            this.instance.far = Math.min(10000, data.far);
        }

        this.instance.position.set(data.position.x, data.position.y, data.position.z);
        this.instance.quaternion.set(data.rotation.x, data.rotation.y, data.rotation.z, data.rotation.w);
        this.instance.updateProjectionMatrix();
    }
}
