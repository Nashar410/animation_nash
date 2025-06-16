
// shared/interfaces/IPreset.ts
import { CameraPreset } from '../types/presets';
import { Camera, RenderSettings } from '../types/rendering';
import { PixelSettings } from '../types/pixelart';

export interface IPreset {
    /**
     * Retourne les informations du preset
     */
    getInfo(): CameraPreset;

    /**
     * Applique le preset à une caméra
     */
    applyToCamera(camera: Camera): Camera;

    /**
     * Retourne les paramètres de rendu recommandés
     */
    getRenderSettings(): Partial<RenderSettings>;

    /**
     * Retourne les paramètres de pixel art recommandés
     */
    getPixelSettings(): Partial<PixelSettings>;
}
