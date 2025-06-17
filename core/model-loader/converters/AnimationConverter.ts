// core/model-loader/converters/AnimationConverter.ts
import * as THREE from 'three';
import { Animation, AnimationChannel, AnimationKeyframe, Vector3, Quaternion } from '@shared/types';
import { ModelLoader } from '../ModelLoader';

export class AnimationConverter {
    public static convert(clip: THREE.AnimationClip, scene: THREE.Object3D): Animation {
        const channels: AnimationChannel[] = [];
        clip.tracks.forEach(track => {
            const [objectName, property] = this.parseTrackName(track.name);
            const target = scene.getObjectByName(objectName);
            if (!target) return;

            if (property === 'position' || property === 'rotation' || property === 'scale') {
                const keyframes: AnimationKeyframe[] = [];
                for (let i = 0; i < track.times.length; i++) {
                    keyframes.push({ time: track.times[i], value: this.extractKeyframeValue(track, i, property) });
                }
                channels.push({ targetId: target.uuid, property, keyframes });
            }
        });

        return {
            id: ModelLoader.generateId('animation'),
            name: clip.name || 'Animation',
            duration: clip.duration,
            channels,
        };
    }

    private static parseTrackName(name: string): [string, string] {
        const parts = name.split('.');
        const objectName = parts.slice(0, -1).join('.');
        const property = parts[parts.length - 1].toLowerCase();

        if (property.includes('position')) return [objectName, 'position'];
        if (property.includes('quaternion') || property.includes('rotation')) return [objectName, 'rotation'];
        if (property.includes('scale')) return [objectName, 'scale'];
        return [objectName, property];
    }

    private static extractKeyframeValue(track: THREE.KeyframeTrack, index: number, property: string): Vector3 | Quaternion | number {
        const values = track.values;
        const stride = track.getValueSize();
        const offset = index * stride;

        if (property === 'rotation' && stride === 4) {
            return { x: values[offset], y: values[offset + 1], z: values[offset + 2], w: values[offset + 3] } as Quaternion;
        } else if (stride === 3) {
            return { x: values[offset], y: values[offset + 1], z: values[offset + 2] } as Vector3;
        }
        return values[offset];
    }
}
