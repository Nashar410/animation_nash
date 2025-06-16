// rendering/three-renderer/ThreeRenderer.ts
import * as THREE from 'three';
import { IRenderer } from '@shared/interfaces';
import { Model3D, Camera, RenderResult, RenderSettings, Light } from '@shared/types';
import {Logger} from "@shared/utils/logger.ts";

export class ThreeRenderer implements IRenderer {
    private scene: THREE.Scene;
    private renderer: THREE.WebGLRenderer;
    private camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
    private logger: Logger;
    private canvas!: HTMLCanvasElement;
    private model: THREE.Group | null = null;
    private mixer: THREE.AnimationMixer | null = null;
    private settings: RenderSettings;

    constructor() {
        this.logger = new Logger('ThreeRenderer');
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: true
        });

        // Default camera
        this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);

        // Default settings
        this.settings = {
            camera: {
                position: { x: 0, y: 0, z: 10 },
                rotation: { x: 0, y: 0, z: 0, w: 1 },
                fov: 75,
                near: 0.1,
                far: 1000,
                type: 'perspective'
            },
            lights: [
                {
                    type: 'ambient',
                    color: { r: 255, g: 255, b: 255, a: 255 },
                    intensity: 0.5
                },
                {
                    type: 'directional',
                    color: { r: 255, g: 255, b: 255, a: 255 },
                    intensity: 0.8,
                    position: { x: 5, y: 5, z: 5 }
                }
            ],
            backgroundColor: { r: 0, g: 0, b: 0, a: 0 },
            antialias: true,
            shadows: false
        };
    }

    initialize(canvas: HTMLCanvasElement): void {
        this.logger.info('Initializing Three.js renderer');
        this.canvas = canvas;

        // Configure renderer
        this.renderer.setSize(canvas.width, canvas.height);
        this.renderer.setClearColor(0x000000, 0);

        // Setup default lighting
        this.setupLights(this.settings.lights);
    }

    render(model: Model3D, camera: Camera, settings?: Partial<RenderSettings>): RenderResult {
        const startTime = performance.now();

        // Update settings if provided
        if (settings) {
            this.updateSettings(settings);
        }

        // Update camera
        this.updateCamera(camera);

        // Load model if different
        if (!this.model || this.model.userData.modelId !== model.id) {
            this.loadModel(model);
        }

        // Render frame
        this.renderer.render(this.scene, this.camera);

        // Get image data
        const imageData = this.getImageData();

        return {
            image: imageData,
            renderTime: performance.now() - startTime,
            frameNumber: 0
        };
    }

    async *renderAnimation(
        model: Model3D,
        animationId: string,
        camera: Camera,
        settings?: Partial<RenderSettings>
    ): AsyncGenerator<RenderResult> {
        this.logger.info(`Rendering animation: ${animationId}`);

        // Update settings
        if (settings) {
            this.updateSettings(settings);
        }

        // Update camera
        this.updateCamera(camera);

        // Load model
        if (!this.model || this.model.userData.modelId !== model.id) {
            this.loadModel(model);
        }

        // Find animation
        const animation = model.animations.find(a => a.id === animationId);
        if (!animation) {
            throw new Error(`Animation not found: ${animationId}`);
        }

        // Setup animation
        if (this.mixer && this.model) {
            const clips = this.model.userData.clips || [];
            const clip = clips.find((c: THREE.AnimationClip) => c.name === animation.name);

            if (clip) {
                const action = this.mixer.clipAction(clip);
                action.play();

                // Calculate frame count (30 fps)
                const fps = 30;
                const frameCount = Math.ceil(animation.duration * fps);
                const frameDuration = 1 / fps;

                // Reset animation
                this.mixer.setTime(0);

                for (let frame = 0; frame < frameCount; frame++) {
                    // Update animation
                    this.mixer.update(frameDuration);

                    // Render frame
                    const startTime = performance.now();
                    this.renderer.render(this.scene, this.camera);

                    yield {
                        image: this.getImageData(),
                        renderTime: performance.now() - startTime,
                        frameNumber: frame
                    };
                }

                action.stop();
            }
        }
    }

    updateSettings(settings: Partial<RenderSettings>): void {
        this.settings = { ...this.settings, ...settings };

        if (settings.backgroundColor) {
            const bg = settings.backgroundColor;
            this.renderer.setClearColor(
                new THREE.Color(bg.r / 255, bg.g / 255, bg.b / 255),
                bg.a / 255
            );
        }

        if (settings.antialias !== undefined) {
            this.renderer.antialias = settings.antialias;
        }

        if (settings.shadows !== undefined) {
            this.renderer.shadowMap.enabled = settings.shadows;
        }

        if (settings.lights) {
            this.setupLights(settings.lights);
        }
    }

    dispose(): void {
        this.logger.info('Disposing Three.js renderer');

        if (this.model) {
            this.scene.remove(this.model);
            this.disposeObject(this.model);
        }

        this.renderer.dispose();
    }

    private updateCamera(camera: Camera): void {
        if (camera.type === 'perspective') {
            if (!(this.camera instanceof THREE.PerspectiveCamera)) {
                this.camera = new THREE.PerspectiveCamera(
                    camera.fov,
                    this.canvas.width / this.canvas.height,
                    camera.near,
                    camera.far
                );
            } else {
                this.camera.fov = camera.fov;
                this.camera.near = camera.near;
                this.camera.far = camera.far;
                this.camera.updateProjectionMatrix();
            }
        } else {
            const aspect = this.canvas.width / this.canvas.height;
            const size = camera.orthographicSize || 10;

            if (!(this.camera instanceof THREE.OrthographicCamera)) {
                this.camera = new THREE.OrthographicCamera(
                    -size * aspect / 2,
                    size * aspect / 2,
                    size / 2,
                    -size / 2,
                    camera.near,
                    camera.far
                );
            } else {
                this.camera.left = -size * aspect / 2;
                this.camera.right = size * aspect / 2;
                this.camera.top = size / 2;
                this.camera.bottom = -size / 2;
                this.camera.updateProjectionMatrix();
            }
        }

        // Update position and rotation
        this.camera.position.set(camera.position.x, camera.position.y, camera.position.z);
        this.camera.quaternion.set(camera.rotation.x, camera.rotation.y, camera.rotation.z, camera.rotation.w);
    }

    private loadModel(model: Model3D): void {
        // Remove existing model
        if (this.model) {
            this.scene.remove(this.model);
            this.disposeObject(this.model);
        }

        // Create new model group
        this.model = new THREE.Group();
        this.model.userData.modelId = model.id;

        // Create materials map
        const materials = new Map<string, THREE.Material>();

        for (const mat of model.materials) {
            const material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(mat.color.r / 255, mat.color.g / 255, mat.color.b / 255),
                opacity: mat.opacity,
                transparent: mat.opacity < 1,
                metalness: mat.metalness || 0,
                roughness: mat.roughness || 1
            });

            materials.set(mat.id, material);
        }

        // Create meshes
        for (const mesh of model.meshes) {
            const geometry = new THREE.BufferGeometry();

            // Set attributes
            geometry.setAttribute('position', new THREE.BufferAttribute(mesh.vertices, 3));
            geometry.setAttribute('normal', new THREE.BufferAttribute(mesh.normals, 3));
            geometry.setAttribute('uv', new THREE.BufferAttribute(mesh.uvs, 2));

            if (mesh.indices) {
                geometry.setIndex(new THREE.BufferAttribute(mesh.indices, 1));
            }

            // Get material
            const material = mesh.materialId ? materials.get(mesh.materialId) : new THREE.MeshStandardMaterial();

            // Create mesh
            const threeMesh = new THREE.Mesh(geometry, material || new THREE.MeshStandardMaterial());
            threeMesh.name = mesh.name;

            this.model.add(threeMesh);
        }

        // Center model
        const box = new THREE.Box3().setFromObject(this.model);
        const center = box.getCenter(new THREE.Vector3());
        this.model.position.sub(center);

        // Add to scene
        this.scene.add(this.model);

        // Setup animation mixer if animations exist
        if (model.animations.length > 0) {
            this.mixer = new THREE.AnimationMixer(this.model);

            // Store clips for later use
            this.model.userData.clips = model.animations.map(anim => {
                const clip = new THREE.AnimationClip(anim.name, anim.duration, []);
                // Note: In a real implementation, we'd need to convert animation channels to Three.js tracks
                return clip;
            });
        }
    }

    private setupLights(lights: Light[]): void {
        // Remove existing lights
        const existingLights = this.scene.children.filter(child => child instanceof THREE.Light);
        existingLights.forEach(light => this.scene.remove(light));

        // Add new lights
        for (const light of lights) {
            let threeLight: THREE.Light;

            switch (light.type) {
                case 'ambient':
                    threeLight = new THREE.AmbientLight(
                        new THREE.Color(light.color.r / 255, light.color.g / 255, light.color.b / 255),
                        light.intensity
                    );
                    break;

                case 'directional':
                    threeLight = new THREE.DirectionalLight(
                        new THREE.Color(light.color.r / 255, light.color.g / 255, light.color.b / 255),
                        light.intensity
                    );
                    if (light.position) {
                        threeLight.position.set(light.position.x, light.position.y, light.position.z);
                    }
                    break;

                case 'point':
                    threeLight = new THREE.PointLight(
                        new THREE.Color(light.color.r / 255, light.color.g / 255, light.color.b / 255),
                        light.intensity
                    );
                    if (light.position) {
                        threeLight.position.set(light.position.x, light.position.y, light.position.z);
                    }
                    break;

                default:
                    continue;
            }

            this.scene.add(threeLight);
        }
    }

    private getImageData(): ImageData {
        const width = this.canvas.width;
        const height = this.canvas.height;

        // Get WebGL context
        const gl = this.renderer.getContext();

        // Read pixels
        const pixels = new Uint8Array(width * height * 4);
        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

        // Flip vertically (WebGL renders upside down)
        const imageData = new ImageData(width, height);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const srcIndex = (y * width + x) * 4;
                const dstIndex = ((height - y - 1) * width + x) * 4;

                imageData.data[dstIndex] = pixels[srcIndex];
                imageData.data[dstIndex + 1] = pixels[srcIndex + 1];
                imageData.data[dstIndex + 2] = pixels[srcIndex + 2];
                imageData.data[dstIndex + 3] = pixels[srcIndex + 3];
            }
        }

        return imageData;
    }

    private disposeObject(object: THREE.Object3D): void {
        if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            if (object.material instanceof THREE.Material) {
                object.material.dispose();
            }
        }

        for (const child of object.children) {
            this.disposeObject(child);
        }
    }
}