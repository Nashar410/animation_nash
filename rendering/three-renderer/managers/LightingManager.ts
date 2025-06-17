// rendering/three-renderer/managers/LightingManager.ts
import * as THREE from 'three';
import { Light as LightData } from '@shared/types';

export class LightingManager {
    private scene: THREE.Scene;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    public setup(lightsData: LightData[], enableShadows: boolean): void {
        // Remove existing lights
        this.scene.children.filter(child => child.isLight).forEach(light => this.scene.remove(light));

        lightsData.forEach(lightData => {
            let light: THREE.Light;
            switch (lightData.type) {
                case 'ambient':
                    light = new THREE.AmbientLight(
                        new THREE.Color(lightData.color.r / 255, lightData.color.g / 255, lightData.color.b / 255),
                        lightData.intensity
                    );
                    break;
                case 'directional':
                    const dirLight = new THREE.DirectionalLight(
                        new THREE.Color(lightData.color.r / 255, lightData.color.g / 255, lightData.color.b / 255),
                        lightData.intensity
                    );
                    if (lightData.position) dirLight.position.set(lightData.position.x, lightData.position.y, lightData.position.z);
                    if (enableShadows) {
                        dirLight.castShadow = true;
                        dirLight.shadow.mapSize.set(2048, 2048);
                    }
                    light = dirLight;
                    break;
                default: return;
            }
            this.scene.add(light);
        });
    }
}
