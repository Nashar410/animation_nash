// shared/interfaces/IRenderer.ts
import { Model3D } from '../types/models';
import { Camera, RenderResult, RenderSettings } from '../types/rendering';

export interface IRenderer {
    /**
     * Initialise le renderer avec un canvas
     */
    initialize(canvas: HTMLCanvasElement): void;

    /**
     * Effectue le rendu d'une frame
     */
    render(model: Model3D, camera: Camera, settings?: Partial<RenderSettings>): RenderResult;

    /**
     * Effectue le rendu d'une animation complète
     */
    renderAnimation(
        model: Model3D,
        animationId: string,
        camera: Camera,
        settings?: Partial<RenderSettings>
    ): AsyncGenerator<RenderResult>;

    /**
     * Met à jour les paramètres de rendu
     */
    updateSettings(settings: Partial<RenderSettings>): void;

    /**
     * Libère les ressources GPU
     */
    dispose(): void;
}
