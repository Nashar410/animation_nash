// rendering/three-renderer/ThreeRenderer.ts (Refactored Orchestrator)
import * as THREE from 'three';
import { IRenderer } from '@shared/interfaces';
import { Model3D, Camera as CameraData, RenderResult, RenderSettings } from '@shared/types';
import { Logger } from "@shared/utils/logger.ts";
import { CameraManager, LightingManager, ModelManager, AnimationManager } from './managers';

export class ThreeRenderer implements IRenderer {
    private renderer: THREE.WebGLRenderer;
    private scene: THREE.Scene;
    private canvas!: HTMLCanvasElement;
    private logger: Logger;

    private cameraManager!: CameraManager;
    private lightingManager!: LightingManager;
    private modelManager!: ModelManager;
    private animationManager!: AnimationManager;

    private settings: RenderSettings;
    private isInitialized = false;

    constructor() {
        this.logger = new Logger('ThreeRenderer');
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });

        this.settings = {
            camera: { position: { x: 0, y: 0, z: 10 }, rotation: { x: 0, y: 0, z: 0, w: 1 }, fov: 75, near: 0.1, far: 1000, type: 'perspective' },
            lights: [{ type: 'ambient', color: { r: 255, g: 255, b: 255, a: 255 }, intensity: 0.5 }, { type: 'directional', color: { r: 255, g: 255, b: 255, a: 255 }, intensity: 0.8, position: { x: 5, y: 5, z: 5 } }],
            backgroundColor: { r: 0, g: 0, b: 0, a: 0 },
            antialias: true,
            shadows: false
        };
    }

    public initialize(canvas: HTMLCanvasElement): void {
        if (this.isInitialized) return;
        this.logger.info('Initializing Three.js renderer');
        this.canvas = canvas;

        this.renderer.setSize(canvas.width, canvas.height);
        this.updateSettings(this.settings);

        // Initialize managers
        this.cameraManager = new CameraManager(canvas, this.settings.camera);
        this.lightingManager = new LightingManager(this.scene);
        this.modelManager = new ModelManager(this.scene);
        this.animationManager = new AnimationManager();

        this.lightingManager.setup(this.settings.lights, this.settings.shadows);
        this.isInitialized = true;
    }

    public loadModel(modelData: Model3D): void {
        if (!this.isInitialized) throw new Error("Renderer not initialized.");
        this.modelManager.load(modelData);
        if (this.modelManager.currentModel) {
            this.animationManager.setup(this.modelManager.currentModel, modelData.animations);
        }
    }

    public render(modelData: Model3D, cameraData: CameraData, settings?: Partial<RenderSettings>): RenderResult {
        if (!this.isInitialized) throw new Error("Renderer not initialized.");

        const startTime = performance.now();
        if (settings) this.updateSettings(settings);

        // Check if model needs to be reloaded
        if (this.modelManager.currentModel?.userData.modelId !== modelData.id) {
            this.loadModel(modelData);
        }

        this.cameraManager.update(cameraData);
        this.animationManager.update();

        this.renderer.render(this.scene, this.cameraManager.instance);

        return {
            image: this.getImageData(),
            renderTime: performance.now() - startTime,
            frameNumber: 0
        };
    }

    public async *renderAnimation(/* ...params */): AsyncGenerator<RenderResult> {
        // This logic would be delegated to the AnimationManager
        this.logger.warn('renderAnimation is not fully implemented in this refactor.');
        yield { image: new ImageData(1, 1), renderTime: 0, frameNumber: 0 };
    }

    public updateSettings(settings: Partial<RenderSettings>): void {
        Object.assign(this.settings, settings);
        const { backgroundColor, shadows, lights } = this.settings;

        this.renderer.setClearColor(new THREE.Color(backgroundColor.r / 255, backgroundColor.g / 255, backgroundColor.b / 255), backgroundColor.a / 255);
        this.renderer.shadowMap.enabled = shadows;

        if (this.lightingManager && lights) {
            this.lightingManager.setup(lights, shadows);
        }
    }

    private getImageData(): ImageData {
        const gl = this.renderer.getContext();
        const { width, height } = this.canvas;
        const pixels = new Uint8Array(width * height * 4);
        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        const imageData = new ImageData(width, height);
        // Flip Y
        for (let y = 0; y < height; y++) {
            const srcY = y * width * 4;
            const destY = (height - y - 1) * width * 4;
            imageData.data.set(pixels.subarray(srcY, srcY + width * 4), destY);
        }
        return imageData;
    }

    public dispose(): void {
        if (!this.isInitialized) return;
        this.logger.info('Disposing Three.js renderer');
        this.modelManager.disposeCurrent();
        this.animationManager.dispose();
        this.renderer.dispose();
        this.isInitialized = false;
    }
}
