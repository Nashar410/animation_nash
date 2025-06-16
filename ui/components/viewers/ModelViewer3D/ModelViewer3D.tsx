// ui/components/viewers/ModelViewer3D/ModelViewer3D.tsx - Rollback avec améliorations ciblées
import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import { Model3D, Camera } from '@shared/types';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

interface ModelViewer3DProps {
    model: Model3D | null;
    camera: Camera;
    width?: number;
    height?: number;
    showHelpers?: boolean;
    onCameraChange?: (camera: Camera) => void;
}

export interface ModelViewer3DRef {
    captureFrame: () => ImageData | null;
}

export const ModelViewer3D = forwardRef<ModelViewer3DRef, ModelViewer3DProps>(({
                                                                                   model,
                                                                                   camera,
                                                                                   width = 400,
                                                                                   height = 400,
                                                                                   showHelpers = false,
                                                                                   onCameraChange,
                                                                               }, ref) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<{
        scene: THREE.Scene;
        camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
        renderer: THREE.WebGLRenderer;
        controls: OrbitControls;
        mixer?: THREE.AnimationMixer;
        clock: THREE.Clock;
        currentModel?: THREE.Group;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // CORRECTION: Capture simple sans auto-cadrage perturbateur
    useImperativeHandle(ref, () => ({
        captureFrame: (): ImageData | null => {
            if (!sceneRef.current) {
                console.warn('❌ No scene available for capture');
                return null;
            }

            const { scene, camera: threeCamera, renderer } = sceneRef.current;

            try {
                // CORRECTION: Pas d'auto-cadrage, utiliser la position actuelle de la caméra
                console.log('📸 Capturing frame with current camera position');

                // Fond uniforme pour éviter les artefacts
                const originalBackground = scene.background;
                scene.background = new THREE.Color(0x404040);

                // Render avec la position actuelle
                renderer.render(scene, threeCamera);

                // Capture pixels
                const gl = renderer.getContext();
                const pixels = new Uint8Array(width * height * 4);
                gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

                // Restore background
                scene.background = originalBackground;

                // Flip vertical
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

                console.log('✅ Frame captured successfully');
                return imageData;
            } catch (error) {
                console.error('❌ Error capturing frame:', error);
                return null;
            }
        }
    }), [width, height]);

    // Initialisation unique
    useEffect(() => {
        const currentMount = mountRef.current;
        if (!currentMount || sceneRef.current) return;

        console.log('🎬 Initializing ModelViewer3D...');

        // Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1a1a);

        // Camera - CORRECTION: Retour aux paramètres normaux
        const aspect = width / height;
        const threeCamera = new THREE.PerspectiveCamera(75, aspect, 0.01, 1000);
        threeCamera.position.set(10, 10, 10);

        // Renderer - CORRECTION: Paramètres équilibrés
        const renderer = new THREE.WebGLRenderer({
            antialias: true, // Retour à l'antialias pour une meilleure qualité
            alpha: true,
            preserveDrawingBuffer: true
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        currentMount.appendChild(renderer.domElement);

        // Controls
        const controls = new OrbitControls(threeCamera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 0.1;
        controls.maxDistance = 100;
        controls.enablePan = true;

        // CORRECTION: Éclairage équilibré (ni trop fort, ni trop faible)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        scene.add(directionalLight);

        const clock = new THREE.Clock();
        sceneRef.current = { scene, camera: threeCamera, renderer, controls, clock };

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);

            const delta = clock.getDelta();

            if (sceneRef.current?.mixer) {
                sceneRef.current.mixer.update(delta);
            }

            controls.update();
            renderer.render(scene, threeCamera);
        };
        animate();

        // Camera change listener
        controls.addEventListener('change', () => {
            if (onCameraChange && sceneRef.current) {
                const cam = sceneRef.current.camera;
                onCameraChange({
                    position: { x: cam.position.x, y: cam.position.y, z: cam.position.z },
                    rotation: { x: cam.quaternion.x, y: cam.quaternion.y, z: cam.quaternion.z, w: cam.quaternion.w },
                    fov: cam instanceof THREE.PerspectiveCamera ? cam.fov : 75,
                    near: cam.near,
                    far: cam.far,
                    type: cam instanceof THREE.PerspectiveCamera ? 'perspective' : 'orthographic',
                });
            }
        });

        return () => {
            console.log('🧹 Disposing ModelViewer3D...');

            if (currentMount && renderer.domElement) {
                currentMount.removeChild(renderer.domElement);
            }

            controls.dispose();
            renderer.dispose();
            sceneRef.current = null;
        };
    }, []);

    // Update camera when props change
    useEffect(() => {
        if (!sceneRef.current) return;

        const { camera: threeCamera } = sceneRef.current;

        // CORRECTION: Mise à jour simple de la caméra sans perturbation
        threeCamera.position.set(camera.position.x, camera.position.y, camera.position.z);
        threeCamera.quaternion.set(camera.rotation.x, camera.rotation.y, camera.rotation.z, camera.rotation.w);

        if (threeCamera instanceof THREE.PerspectiveCamera) {
            threeCamera.fov = camera.fov;
            threeCamera.updateProjectionMatrix();
        }
    }, [camera]);

    // Update helpers
    useEffect(() => {
        if (!sceneRef.current) return;

        const { scene } = sceneRef.current;

        const helpers = scene.children.filter(child => child.userData.isHelper);
        helpers.forEach(helper => scene.remove(helper));

        if (showHelpers) {
            const gridHelper = new THREE.GridHelper(20, 20, 0x888888, 0x444444);
            gridHelper.userData.isHelper = true;
            scene.add(gridHelper);

            const axesHelper = new THREE.AxesHelper(5);
            axesHelper.userData.isHelper = true;
            scene.add(axesHelper);
        }
    }, [showHelpers]);

    // CORRECTION: Update model avec scaling raisonnable
    useEffect(() => {
        if (!sceneRef.current || !model) return;

        setIsLoading(true);
        const { scene } = sceneRef.current;

        console.log('🎨 Loading model into scene...');

        // Remove existing models
        if (sceneRef.current.currentModel) {
            scene.remove(sceneRef.current.currentModel);
            sceneRef.current.currentModel.traverse((obj) => {
                if (obj instanceof THREE.Mesh) {
                    obj.geometry.dispose();
                    if (Array.isArray(obj.material)) {
                        obj.material.forEach(mat => mat.dispose());
                    } else if (obj.material instanceof THREE.Material) {
                        obj.material.dispose();
                    }
                }
            });
        }

        // Dispose existing mixer
        if (sceneRef.current.mixer) {
            sceneRef.current.mixer.stopAllAction();
            sceneRef.current.mixer = undefined;
        }

        // Create model group
        const modelGroup = new THREE.Group();
        modelGroup.userData.isModel = true;

        // Create materials
        const materials = new Map<string, THREE.Material>();

        model.materials.forEach(mat => {
            const material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(mat.color.r / 255, mat.color.g / 255, mat.color.b / 255),
                metalness: mat.metalness || 0.1,
                roughness: mat.roughness || 0.8,
            });

            materials.set(mat.id, material);
        });

        // Create meshes
        let meshCount = 0;
        model.meshes.forEach(mesh => {
            try {
                const geometry = new THREE.BufferGeometry();

                if (mesh.vertices && mesh.vertices.length > 0) {
                    geometry.setAttribute('position', new THREE.BufferAttribute(mesh.vertices, 3));

                    if (mesh.normals && mesh.normals.length > 0) {
                        geometry.setAttribute('normal', new THREE.BufferAttribute(mesh.normals, 3));
                    } else {
                        geometry.computeVertexNormals();
                    }

                    if (mesh.uvs && mesh.uvs.length > 0) {
                        geometry.setAttribute('uv', new THREE.BufferAttribute(mesh.uvs, 2));
                    }

                    if (mesh.indices && mesh.indices.length > 0) {
                        geometry.setIndex(new THREE.BufferAttribute(mesh.indices, 1));
                    }

                    const material = mesh.materialId && materials.has(mesh.materialId)
                        ? materials.get(mesh.materialId)!
                        : new THREE.MeshStandardMaterial({ color: 0x888888 });

                    const threeMesh = new THREE.Mesh(geometry, material);
                    threeMesh.name = mesh.name;
                    threeMesh.castShadow = true;
                    threeMesh.receiveShadow = true;

                    modelGroup.add(threeMesh);
                    meshCount++;
                }
            } catch (error) {
                console.warn(`⚠️ Failed to create mesh ${mesh.name}:`, error);
            }
        });

        if (meshCount > 0) {
            // CORRECTION: Centrage et scaling modéré (comme avant)
            const box = new THREE.Box3().setFromObject(modelGroup);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());

            // Centrer le modèle
            modelGroup.position.sub(center);

            // CORRECTION: Scaling plus raisonnable (retour aux valeurs d'origine)
            const maxDimension = Math.max(size.x, size.y, size.z);
            if (maxDimension > 10) {
                const scale = 8 / maxDimension; // Moins agressif
                modelGroup.scale.setScalar(scale);
                console.log(`📏 Model scaled by: ${scale.toFixed(2)}`);
            }

            scene.add(modelGroup);
            sceneRef.current.currentModel = modelGroup;

            // Setup animations si présentes
            if (model.animations.length > 0) {
                const mixer = new THREE.AnimationMixer(modelGroup);
                sceneRef.current.mixer = mixer;
                console.log(`🎬 Model loaded: ${meshCount} meshes, ${model.animations.length} animations`);
            }

            console.log(`✅ Model loaded successfully`);
        }

        setIsLoading(false);
    }, [model]);

    return (
        <div className="relative" style={{ width, height }}>
            <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
                    <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        <span>Loading model...</span>
                    </div>
                </div>
            )}
            {!model && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    No model loaded
                </div>
            )}
        </div>
    );
});