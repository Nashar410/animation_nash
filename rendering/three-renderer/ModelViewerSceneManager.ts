// rendering/three-renderer/ModelViewerSceneManager.ts
import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Camera, Model3D } from '@shared/types';
import { ModelLoaderHelper } from './ModelLoaderHelper';
import { HighQualityCapturer } from './HighQualityCapturer';

type OnCameraChangeCallback = (camera: Camera) => void;

export class ModelViewerSceneManager {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private controls: OrbitControls;
    private mixer?: THREE.AnimationMixer;
    private clock: THREE.Clock;
    private currentModel?: THREE.Group;
    private animations: THREE.AnimationClip[] = [];
    private mount: HTMLDivElement;
    private onCameraChange?: OnCameraChangeCallback;
    private animationFrameId: number = 0;

    constructor(mount: HTMLDivElement, initialCamera: Camera, onCameraChange?: OnCameraChangeCallback) {
        this.mount = mount;
        this.onCameraChange = onCameraChange;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a1a);

        this.camera = new THREE.PerspectiveCamera(initialCamera.fov, mount.clientWidth / mount.clientHeight, initialCamera.near, initialCamera.far);
        this.updateCamera(initialCamera);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: "high-performance" });
        this.renderer.setSize(mount.clientWidth, mount.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.mount.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;

        this.addLights();

        this.clock = new THREE.Clock();
        this.animate();

        this.controls.addEventListener('change', this.handleCameraChange);
    }

    private addLights(): void {
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambient);
        const directional = new THREE.DirectionalLight(0xffffff, 0.8);
        directional.position.set(5, 5, 5);
        directional.castShadow = true;
        directional.shadow.mapSize.set(2048, 2048);
        this.scene.add(directional);
    }

    private handleCameraChange = () => {
        if (this.onCameraChange) {
            const { position, quaternion } = this.camera;
            this.onCameraChange({
                position: { x: position.x, y: position.y, z: position.z },
                rotation: { x: quaternion.x, y: quaternion.y, z: quaternion.z, w: quaternion.w },
                fov: this.camera.fov,
                near: this.camera.near,
                far: this.camera.far,
                type: 'perspective',
            });
        }
    }

    public loadModel(modelData: Model3D | null): void {
        if (this.currentModel) {
            this.scene.remove(this.currentModel);
            // Proper disposal is important
            this.currentModel.traverse(obj => {
                if (obj instanceof THREE.Mesh) {
                    obj.geometry.dispose();
                    if (Array.isArray(obj.material)) {
                        obj.material.forEach(mat => mat.dispose());
                    } else {
                        obj.material.dispose();
                    }
                }
            });
        }

        if (!modelData) {
            this.currentModel = undefined;
            this.animations = [];
            this.mixer = undefined;
            return;
        }

        this.currentModel = ModelLoaderHelper.createThreeGroup(modelData);
        this.scene.add(this.currentModel);

        if (modelData.animations && modelData.animations.length > 0) {
            // This part would need to convert your Animation format to THREE.AnimationClip
            // For now, we'll assume a placeholder if GLTFLoader isn't used.
            // this.animations = modelData.animations.map(a => ...);
            // this.mixer = new THREE.AnimationMixer(this.currentModel);
        }
    }

 
    public updateCallbacks(onCameraChange?: OnCameraChangeCallback): void {
        this.onCameraChange = onCameraChange;
    }

    public updateCamera(cameraData: Camera): void {
        this.camera.position.set(cameraData.position.x, cameraData.position.y, cameraData.position.z);
        this.camera.quaternion.set(cameraData.rotation.x, cameraData.rotation.y, cameraData.rotation.z, cameraData.rotation.w);
        this.camera.fov = cameraData.fov;
        this.camera.updateProjectionMatrix();
    }

    public toggleHelpers(show: boolean): void {
        this.scene.children.filter(c => c.userData.isHelper).forEach(h => this.scene.remove(h));
        if (show) {
            const grid = new THREE.GridHelper(20, 20, 0x888888, 0x444444);
            grid.userData.isHelper = true;
            this.scene.add(grid);
        }
    }

    public playAnimation(_name: string): void { /* TODO */ }
    public pauseAnimation(): void { /* TODO */ }
    public resetAnimation(): void { /* TODO */ }
    public getAnimations = (): string[] => this.animations.map(a => a.name);

    public captureFrame = (): ImageData | null => {
        if (!this.currentModel) return null;
        return HighQualityCapturer.capture(this.scene, this.camera, this.renderer, this.currentModel, this.mount.clientWidth, this.mount.clientHeight);
    }

    private animate = () => {
        this.animationFrameId = requestAnimationFrame(this.animate);
        const delta = this.clock.getDelta();
        if (this.mixer) this.mixer.update(delta);
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    public dispose(): void {
        cancelAnimationFrame(this.animationFrameId);
        this.controls.removeEventListener('change', this.handleCameraChange);
        this.controls.dispose();
        this.renderer.dispose();
        if (this.mount && this.renderer.domElement) {
            this.mount.removeChild(this.renderer.domElement);
        }
    }
}
