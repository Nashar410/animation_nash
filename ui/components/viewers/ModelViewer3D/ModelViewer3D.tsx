// ui/components/viewers/ModelViewer3D/ModelViewer3D.tsx - Correction du cadrage
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
        modelBounds?: THREE.Box3;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // CORRECTION: Méthode de capture améliorée avec cadrage automatique
    useImperativeHandle(ref, () => ({
        captureFrame: (): ImageData | null => {
            if (!sceneRef.current || !sceneRef.current.currentModel) {
                console.warn('❌ No scene or model available for capture');
                return null;
            }

            const { scene, camera: threeCamera, renderer, currentModel, modelBounds } = sceneRef.current;

            try {
                // CORRECTION: Auto-cadrage du modèle pour la capture
                if (modelBounds) {
                    const boundingBox = modelBounds.clone();
                    const center = boundingBox.getCenter(new THREE.Vector3());
                    const size = boundingBox.getSize(new THREE.Vector3());

                    // Calcul de la distance optimale pour cadrer le modèle
                    const maxDimension = Math.max(size.x, size.y, size.z);
                    const fov = threeCamera instanceof THREE.PerspectiveCamera ? threeCamera.fov : 60;
                    const distance = maxDimension / (2 * Math.tan((fov * Math.PI / 180) / 2)) * 1.5; // 1.5x pour marge

                    // Position temporaire de la caméra pour capture optimale
                    const tempPosition = threeCamera.position.clone();
                    const tempTarget = new THREE.Vector3();

                    // CORRECTION: Positionner la caméra pour bien cadrer le modèle
                    threeCamera.position.copy(center);
                    threeCamera.position.y += size.y * 0.3; // Légèrement au-dessus du centre
                    threeCamera.position.z += distance;
                    threeCamera.lookAt(center);
                    threeCamera.updateMatrixWorld();

                    console.log(`📐 Auto-framing: distance=${distance.toFixed(2)}, center=(${center.x.toFixed(1)}, ${center.y.toFixed(1)}, ${center.z.toFixed(1)})`);
                }

                // CORRECTION: Fond uniforme pour la capture
                const originalBackground = scene.background;
                scene.background = new THREE.Color(0x404040); // Gris moyen pour éviter les artefacts

                // Force render
                renderer.render(scene, threeCamera);

                // Capture des pixels
                const gl = renderer.getContext();
                const pixels = new Uint8Array(width * height * 4);
                gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

                // Restore background
                scene.background = originalBackground;

                // CORRECTION: Flip vertical avec nettoyage des artefacts
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

                console.log('✅ Frame captured with auto-framing');
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

        // Camera
        const aspect = width / height;
        const threeCamera = new THREE.PerspectiveCamera(60, aspect, 0.01, 1000); // FOV réduit pour moins de distorsion
        threeCamera.position.set(10, 10, 10);

        // Renderer
        const renderer = new THREE.WebGLRenderer({
            antialias: false, // CORRECTION: Pas d'antialiasing pour pixel art
            alpha: true,
            preserveDrawingBuffer: true
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(1); // CORRECTION: Ratio fixe pour consistance
        renderer.shadowMap.enabled = false; // CORRECTION: Pas d'ombres pour simplifier
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        currentMount.appendChild(renderer.domElement);

        // Controls
        const controls = new OrbitControls(threeCamera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 0.5;
        controls.maxDistance = 50;
        controls.enablePan = true;

        // CORRECTION: Éclairage simplifié et plus uniforme
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // Plus lumineux
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = false;
        scene.add(directionalLight);

        // Lumière de remplissage pour éviter les zones trop sombres
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.2);
        fillLight.position.set(-5, -5, -5);
        scene.add(fillLight);

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
                    fov: cam instanceof THREE.PerspectiveCamera ? cam.fov : 60,
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

    // Update camera
    useEffect(() => {
        if (!sceneRef.current) return;

        const { camera: threeCamera } = sceneRef.current;
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

    // CORRECTION: Update model avec meilleur cadrage
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

        // CORRECTION: Matériaux plus simples et consistants
        const materials = new Map<string, THREE.Material>();

        model.materials.forEach(mat => {
            const material = new THREE.MeshLambertMaterial({
                color: new THREE.Color(mat.color.r / 255, mat.color.g / 255, mat.color.b / 255),
                transparent: mat.opacity < 1,
                opacity: mat.opacity,
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
                        : new THREE.MeshLambertMaterial({ color: 0x888888 });

                    const threeMesh = new THREE.Mesh(geometry, material);
                    threeMesh.name = mesh.name;

                    modelGroup.add(threeMesh);
                    meshCount++;
                }
            } catch (error) {
                console.warn(`⚠️ Failed to create mesh ${mesh.name}:`, error);
            }
        });

        if (meshCount > 0) {
            // CORRECTION: Calcul précis des bounds pour cadrage
            const boundingBox = new THREE.Box3().setFromObject(modelGroup);
            const center = boundingBox.getCenter(new THREE.Vector3());
            const size = boundingBox.getSize(new THREE.Vector3());

            // CORRECTION: Centrage optimal
            modelGroup.position.sub(center);
            modelGroup.position.y += size.y * 0.1; // Légèrement vers le haut pour éviter le crop

            // CORRECTION: Scaling pour remplir 70% de la vue
            const maxDimension = Math.max(size.x, size.y, size.z);
            if (maxDimension > 0) {
                const targetSize = 8; // Taille dans la scène
                const scale = targetSize / maxDimension;
                modelGroup.scale.setScalar(scale);
                console.log(`📏 Model scaled by: ${scale.toFixed(2)} (bounds: ${size.x.toFixed(1)}×${size.y.toFixed(1)}×${size.z.toFixed(1)})`);
            }

            scene.add(modelGroup);

            // Stocker les références pour la capture
            sceneRef.current.currentModel = modelGroup;
            sceneRef.current.modelBounds = boundingBox;

            // Setup animations si présentes
            if (model.animations.length > 0) {
                const mixer = new THREE.AnimationMixer(modelGroup);
                sceneRef.current.mixer = mixer;
                console.log(`🎬 Model loaded: ${meshCount} meshes, ${model.animations.length} animations`);
            }

            console.log(`✅ Model loaded and positioned for optimal capture`);
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