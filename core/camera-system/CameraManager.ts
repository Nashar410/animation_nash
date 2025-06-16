// core/camera-system/CameraManager.ts


import {Camera} from "@shared/types/rendering.ts";
import {Logger} from "@shared/utils/logger.ts";
import {IPreset} from "@shared/interfaces";
import {EventBus} from "@shared/events/EventBus.ts";
import {AppEvents} from "@shared/events/events.ts";
import {lerp} from "@shared/utils/math.ts";
import {Quaternion, Vector3} from "@shared/types/models.ts";

export interface CameraTransition {
    from: Camera;
    to: Camera;
    duration: number;
    elapsed: number;
    easing?: (t: number) => number;
}

export class CameraManager {
    private camera: Camera;
    private transition: CameraTransition | null = null;
    private logger: Logger;
    private presets: Map<string, IPreset> = new Map();
    private currentPresetId: string | null = null;

    constructor(
        initialCamera: Camera,
        private eventBus?: EventBus
    ) {
        this.camera = { ...initialCamera };
        this.logger = new Logger('CameraManager');
    }

    getCamera(): Camera {
        return { ...this.camera };
    }

    setCamera(camera: Camera, transition?: number): void {
        if (transition && transition > 0) {
            this.startTransition(this.camera, camera, transition);
        } else {
            this.camera = { ...camera };
            this.notifyChange();
        }
    }

    registerPreset(id: string, preset: IPreset): void {
        this.presets.set(id, preset);
        this.logger.info(`Registered preset: ${id}`);
    }

    applyPreset(presetId: string, transition?: number): void {
        const preset = this.presets.get(presetId);
        if (!preset) {
            this.logger.error(`Preset not found: ${presetId}`);
            return;
        }

        const newCamera = preset.applyToCamera(this.camera);
        this.setCamera(newCamera, transition);
        this.currentPresetId = presetId;

        this.eventBus?.emit(AppEvents.PRESET_CHANGED, presetId);
    }

    getCurrentPresetId(): string | null {
        return this.currentPresetId;
    }

    getPresets(): Map<string, IPreset> {
        return new Map(this.presets);
    }

    update(deltaTime: number): void {
        if (this.transition) {
            this.updateTransition(deltaTime);
        }
    }

    private startTransition(from: Camera, to: Camera, duration: number): void {
        this.transition = {
            from: { ...from },
            to: { ...to },
            duration,
            elapsed: 0,
            easing: this.easeInOutCubic,
        };
    }

    private updateTransition(deltaTime: number): void {
        if (!this.transition) return;

        this.transition.elapsed += deltaTime;
        const t = Math.min(this.transition.elapsed / this.transition.duration, 1);
        const easedT = this.transition.easing ? this.transition.easing(t) : t;

        // Interpolate camera properties
        this.camera.position = this.lerpVector3(
            this.transition.from.position,
            this.transition.to.position,
            easedT
        );

        this.camera.rotation = this.slerpQuaternion(
            this.transition.from.rotation,
            this.transition.to.rotation,
            easedT
        );

        this.camera.fov = lerp(this.transition.from.fov, this.transition.to.fov, easedT);

        if (this.camera.type === 'orthographic' && this.camera.orthographicSize !== undefined) {
            const fromSize = this.transition.from.orthographicSize || 10;
            const toSize = this.transition.to.orthographicSize || 10;
            this.camera.orthographicSize = lerp(fromSize, toSize, easedT);
        }

        this.notifyChange();

        if (t >= 1) {
            this.transition = null;
        }
    }

    private lerpVector3(a: Vector3, b: Vector3, t: number): Vector3 {
        return {
            x: lerp(a.x, b.x, t),
            y: lerp(a.y, b.y, t),
            z: lerp(a.z, b.z, t),
        };
    }

    private slerpQuaternion(a: Quaternion, b: Quaternion, t: number): Quaternion {
        // Simplified slerp implementation
        const dot = a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w;
        const theta = Math.acos(Math.min(Math.max(dot, -1), 1));
        const sinTheta = Math.sin(theta);

        if (sinTheta < 0.001) {
            return {
                x: lerp(a.x, b.x, t),
                y: lerp(a.y, b.y, t),
                z: lerp(a.z, b.z, t),
                w: lerp(a.w, b.w, t),
            };
        }

        const wa = Math.sin((1 - t) * theta) / sinTheta;
        const wb = Math.sin(t * theta) / sinTheta;

        return {
            x: wa * a.x + wb * b.x,
            y: wa * a.y + wb * b.y,
            z: wa * a.z + wb * b.z,
            w: wa * a.w + wb * b.w,
        };
    }

    private easeInOutCubic(t: number): number {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    private notifyChange(): void {
        this.eventBus?.emit('camera:changed', this.camera);
    }
}