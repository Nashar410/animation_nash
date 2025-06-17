// rendering/three-renderer/managers/AnimationManager.ts
import * as THREE from 'three';
import { Animation as AnimationData } from '@shared/types';
import { Logger } from '@shared/utils/logger';

export class AnimationManager {
    public mixer: THREE.AnimationMixer | null = null;
    private clock: THREE.Clock;
    private logger: Logger;

    constructor() {
        this.clock = new THREE.Clock();
        this.logger = new Logger('AnimationManager');
    }

    public setup(modelGroup: THREE.Group, animations: AnimationData[]): void {
        if (animations.length > 0) {
            this.mixer = new THREE.AnimationMixer(modelGroup);
            // In a real scenario, you would convert `AnimationData` to `THREE.AnimationClip` here.
            // For now, this is a placeholder.
            this.logger.info(`AnimationMixer setup for ${animations.length} animations.`);
        } else {
            this.mixer = null;
        }
    }

    public update(): void {
        if (this.mixer) {
            this.mixer.update(this.clock.getDelta());
        }
    }

    public dispose(): void {
        this.mixer = null;
    }
}
