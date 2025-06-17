// rendering/three-renderer/managers/ModelViewerSceneManager.ts
import * as THREE from 'three';
import { Model3D, RenderSettings } from '@shared/types';
import { AnimationManager, CameraManager, LightingManager, ModelManager } from './';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class ModelViewerSceneManager {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
    private renderer: THREE.WebGLRenderer;
    private controls: OrbitControls;

    // Managers
    private modelManager: ModelManager;
    private lightingManager: LightingManager;
    private cameraManager: CameraManager;
    private animationManager: AnimationManager;

    private animationFrameId: number = 0;

    constructor(private canvas: HTMLCanvasElement) {
        this.scene = new THREE.Scene();
        this.renderer = this.createRenderer(canvas);

        // Initialisation des managers
        this.modelManager = new ModelManager(this.scene);
        this.lightingManager = new LightingManager(this.scene);
        this.cameraManager = new CameraManager();
        this.animationManager = new AnimationManager();

        // Caméra par défaut (sera écrasée par les settings)
        this.camera = this.cameraManager.getCamera();
        this.scene.add(this.camera);

        // Contrôles
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    }

    private createRenderer(canvas: HTMLCanvasElement): THREE.WebGLRenderer {
        const renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: true,
            preserveDrawingBuffer: true, // Essentiel pour la capture d'image
        });
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        return renderer;
    }

    public initialize(renderSettings: RenderSettings): void {
        this.applyRenderSettings(renderSettings);
        this.startRendering();
    }

    public setupModel(model: Model3D): void {
        this.modelManager.loadModel(model);
        const modelGroup = this.modelManager.getModelGroup();
        if (modelGroup) {
            // Configuration de l'animation manager avec le modèle chargé
            this.animationManager.setup(modelGroup, model.animations);

            // Centrer la caméra sur le nouveau modèle
            this.cameraManager.frameObject(modelGroup, this.controls);
            this.camera = this.cameraManager.getCamera();
        }
    }

    public applyRenderSettings(settings: RenderSettings): void {
        this.cameraManager.updateCamera(settings.camera);
        this.camera = this.cameraManager.getCamera();
        this.lightingManager.updateLights(settings.lights);

        const bgColor = settings.backgroundColor;
        this.scene.background = new THREE.Color(bgColor.r / 255, bgColor.g / 255, bgColor.b / 255);
    }

    // --- NOUVELLES MÉTHODES DE CONTRÔLE D'ANIMATION ---
    public playAnimation(animationName: string): void {
        this.animationManager.play(animationName);
    }

    public pauseAnimation(): void {
        this.animationManager.pause();
    }

    public resetAnimation(): void {
        this.animationManager.reset();
    }

    public getAnimations(): string[] {
        return this.animationManager.getAnimationNames();
    }
    // --- FIN DES NOUVELLES MÉTHODES ---

    public captureFrame(): ImageData | null {
        this.render(); // Assurer un rendu frais avant la capture
        const context = this.renderer.getContext();
        if (!context) return null;
        return context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }

    private startRendering(): void {
        this.stopRendering();
        this.animate();
    }

    private stopRendering(): void {
        cancelAnimationFrame(this.animationFrameId);
    }

    private animate = (): void => {
        this.animationFrameId = requestAnimationFrame(this.animate);
        this.controls.update();

        // Mettre à jour le mixer d'animation à chaque frame
        this.animationManager.update();

        this.render();
    }

    private render(): void {
        this.renderer.render(this.scene, this.camera);
    }

    public resize(width: number, height: number): void {
        this.cameraManager.updateAspectRatio(width / height);
        this.camera = this.cameraManager.getCamera();
        this.renderer.setSize(width, height);
    }

    public dispose(): void {
        this.stopRendering();
        this.modelManager.dispose();
        this.lightingManager.dispose();
        this.animationManager.dispose();
        this.renderer.dispose();
        this.controls.dispose();
    }
}
