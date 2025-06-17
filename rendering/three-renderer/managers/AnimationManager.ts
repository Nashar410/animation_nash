// rendering/three-renderer/managers/AnimationManager.ts
import * as THREE from 'three';
import { Animation as AnimationData, Vector3, Quaternion } from '@shared/types';
import { Logger } from '@shared/utils/logger';

export class AnimationManager {
    public mixer: THREE.AnimationMixer | null = null;
    private clock: THREE.Clock;
    private logger: Logger;

    // Propriétés pour gérer l'état des animations
    private clips = new Map<string, THREE.AnimationClip>();
    private currentAction: THREE.AnimationAction | null = null;
    private modelGroup: THREE.Group | null = null;

    constructor() {
        this.clock = new THREE.Clock();
        this.logger = new Logger('AnimationManager');
    }

    /**
     * Initialise l'AnimationManager avec un groupe de modèles et des données d'animation.
     * Convertit les données d'animation personnalisées en THREE.AnimationClip.
     */
    public setup(modelGroup: THREE.Group, animations: AnimationData[]): void {
        this.dispose(); // Nettoie l'état précédent pour un nouveau modèle
        this.modelGroup = modelGroup;

        if (animations.length > 0 && this.modelGroup) {
            this.mixer = new THREE.AnimationMixer(this.modelGroup);

            animations.forEach(animData => {
                const clip = this.convertDataToClip(animData);
                this.clips.set(clip.name, clip);
            });

            this.logger.info(`AnimationMixer configuré avec ${this.clips.size} clip(s).`);
        } else {
            this.logger.info('Aucune animation à configurer.');
        }
    }

    /**
     * Convertit notre format de données d'animation interne en un THREE.AnimationClip.
     */
    private convertDataToClip(animData: AnimationData): THREE.AnimationClip {
        const tracks: THREE.KeyframeTrack[] = [];

        animData.channels.forEach(channel => {
            // Retrouve le noeud (os, mesh) cible par son UUID stocké lors de la conversion
            const targetNode = this.modelGroup?.getObjectByProperty('uuid', channel.targetId);

            if (!targetNode) {
                 this.logger.warn(`Nœud cible non trouvé pour l'animation : ${channel.targetId}`);
                 return;
            }

            const times = new Float32Array(channel.keyframes.map(kf => kf.time));
            const values = new Float32Array(channel.keyframes.flatMap(kf => {
                const val = kf.value as Vector3 | Quaternion;
                // Gère à la fois les quaternions (4D) et les vecteurs (3D)
                return 'w' in val ? [val.x, val.y, val.z, val.w] : [val.x, val.y, val.z];
            }));

            const propertyName = channel.property === 'rotation' ? 'quaternion' : channel.property;
            const trackName = `${targetNode.name}.${propertyName}`;

            const trackType = propertyName === 'quaternion'
                ? THREE.QuaternionKeyframeTrack
                : THREE.VectorKeyframeTrack;

            tracks.push(new trackType(trackName, times, values));
        });

        return new THREE.AnimationClip(animData.name, animData.duration, tracks);
    }

    /**
     * Joue une animation par son nom.
     */
    public play(animationName: string): void {
        if (!this.mixer) return;

        const clip = this.clips.get(animationName);
        if (!clip) {
            this.logger.warn(`Le clip d'animation "${animationName}" n'a pas été trouvé.`);
            return;
        }

        // Fondu sortant de l'animation précédente pour une transition douce
        if (this.currentAction) {
            this.currentAction.fadeOut(0.2);
        }

        this.currentAction = this.mixer.clipAction(clip);
        this.currentAction.reset().fadeIn(0.2).play();
        this.logger.info(`Lecture de l'animation : ${animationName}`);
    }

    /**
     * Met en pause ou reprend l'animation en cours.
     */
    public pause(): void {
        if (this.currentAction) {
            this.currentAction.paused = !this.currentAction.paused;
            this.logger.info(`Animation ${this.currentAction.paused ? 'en pause' : 'reprise'}.`);
        }
    }

    /**
     * Réinitialise l'animation en cours à son point de départ.
     */
    public reset(): void {
        if (this.mixer) {
            this.mixer.setTime(0);
            if (this.currentAction) {
                // Mettre en pause après le reset pour éviter une lecture automatique
                this.currentAction.stop().play();
                this.currentAction.paused = true;
            }
             this.logger.info(`Animation réinitialisée.`);
        }
    }

    /**
     * Met à jour le mixer d'animation. Doit être appelé dans la boucle de rendu.
     */
    public update(): void {
        if (this.mixer) {
            this.mixer.update(this.clock.getDelta());
        }
    }

    /**
     * Retourne la liste des noms des animations disponibles.
     */
    public getAnimationNames(): string[] {
        return Array.from(this.clips.keys());
    }

    /**
     * Libère les ressources et nettoie l'état.
     */
    public dispose(): void {
        if (this.mixer) this.mixer.stopAllAction();
        this.mixer = null;
        this.clips.clear();
        this.currentAction = null;
        this.modelGroup = null;
    }
}
