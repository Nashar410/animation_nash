
// rendering/three-renderer/SceneManager.ts
import * as THREE from 'three';

export class SceneManager {
    private scene: THREE.Scene;
    private helpers: Map<string, THREE.Object3D> = new Map();

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    addGridHelper(size: number = 10, divisions: number = 10): void {
        const grid = new THREE.GridHelper(size, divisions);
        this.helpers.set('grid', grid);
        this.scene.add(grid);
    }

    addAxesHelper(size: number = 5): void {
        const axes = new THREE.AxesHelper(size);
        this.helpers.set('axes', axes);
        this.scene.add(axes);
    }

    toggleHelper(name: string, visible: boolean): void {
        const helper = this.helpers.get(name);
        if (helper) {
            helper.visible = visible;
        }
    }

    clearHelpers(): void {
        this.helpers.forEach(helper => {
            this.scene.remove(helper);
        });
        this.helpers.clear();
    }
}