// ui/components/viewers/ModelViewer3D/ModelViewer3D.tsx - Version avec capture haute qualité
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

    // AMÉLIORATION: Capture haute qualité avec multi-sampling
    useImperativeHandle(ref, () => ({
        captureFrame: (): ImageData | null => {
            if (!sceneRef.current || !sceneRef.current.currentModel) {
                console.warn('❌ No scene or model available for capture');
                return null;
            }

            const { scene, camera: threeCamera, renderer, currentModel } = sceneRef.current;

            try {
                console.log('📸 High-quality capture starting...');

                // Sauvegarder l'état actuel
                const originalBackground = scene.background;
                const originalShadows = renderer.shadowMap.enabled;
                const originalToneMapping = renderer.toneMapping;
                const originalExposure = renderer.toneMappingExposure;

                // AMÉLIORATION 1: Configuration optimale pour la capture
                scene.background = new THREE.Color(0x000000); // Fond noir pour éviter les artefacts
                renderer.shadowMap.enabled = false; // Désactiver les ombres
                renderer.toneMapping = THREE.NoToneMapping; // Pas de tone mapping
                renderer.toneMappingExposure = 1.0;

                // AMÉLIORATION 2: Auto-cadrage intelligent sur le modèle
                const box = new THREE.Box3().setFromObject(currentModel);
                const size = box.getSize(new THREE.Vector3());
                const center = box.getCenter(new THREE.Vector3());

                // Calculer la distance optimale pour cadrer le modèle
                const maxDim = Math.max(size.x, size.y, size.z);
                const fov = threeCamera instanceof THREE.PerspectiveCamera ? threeCamera.fov : 50;
                //const aspect = width / height;

                // Distance pour que le modèle remplisse ~80% du cadre
                const distance = (maxDim / 2) / Math.tan((fov * Math.PI / 180) / 2) * 1.5;

                // Sauvegarder la position actuelle
                const originalPosition = threeCamera.position.clone();
                const originalTarget = sceneRef.current.controls ? sceneRef.current.controls.target.clone() : new THREE.Vector3();

                // AMÉLIORATION 3: Positionner la caméra pour un cadrage optimal
                if (threeCamera instanceof THREE.PerspectiveCamera) {
                    // Vue légèrement en angle pour le pixel art (45° classique)
                    const angle = Math.PI / 4; // 45 degrés
                    const elevation = Math.PI / 6; // 30 degrés

                    threeCamera.position.set(
                        center.x + distance * Math.cos(angle) * Math.cos(elevation),
                        center.y + distance * Math.sin(elevation),
                        center.z + distance * Math.sin(angle) * Math.cos(elevation)
                    );

                    threeCamera.lookAt(center);
                }

                // AMÉLIORATION 4: Éclairage optimal pour pixel art
                const tempLights: THREE.Light[] = [];

                // Lumière ambiante forte pour éviter les zones sombres
                const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
                scene.add(ambientLight);
                tempLights.push(ambientLight);

                // Lumière directionnelle douce
                const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
                directionalLight.position.set(5, 10, 5);
                scene.add(directionalLight);
                tempLights.push(directionalLight);

                // AMÉLIORATION 5: Rendu multi-échantillonné
                const samples = 4; // 4x4 super-sampling
                const superWidth = width * samples;
                const superHeight = height * samples;

                // Créer un render target haute résolution
                const renderTarget = new THREE.WebGLRenderTarget(superWidth, superHeight, {
                    format: THREE.RGBAFormat,
                    type: THREE.UnsignedByteType,
                    minFilter: THREE.LinearFilter,
                    magFilter: THREE.LinearFilter,
                    generateMipmaps: false,
                    stencilBuffer: false,
                    depthBuffer: true,
                    samples: 0 // Pas de MSAA, on fait notre propre super-sampling
                });

                // Render haute résolution
                renderer.setRenderTarget(renderTarget);
                renderer.setSize(superWidth, superHeight);
                renderer.render(scene, threeCamera);

                // Lire les pixels haute résolution
                const pixelsHR = new Uint8Array(superWidth * superHeight * 4);
                renderer.readRenderTargetPixels(renderTarget, 0, 0, superWidth, superHeight, pixelsHR);

                // AMÉLIORATION 6: Downsampling intelligent avec anti-aliasing
                const imageData = new ImageData(width, height);

                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        let r = 0, g = 0, b = 0, a = 0;

                        // Moyenner les pixels du bloc samples x samples
                        for (let dy = 0; dy < samples; dy++) {
                            for (let dx = 0; dx < samples; dx++) {
                                const sx = x * samples + dx;
                                const sy = y * samples + dy;
                                const si = ((superHeight - 1 - sy) * superWidth + sx) * 4;

                                r += pixelsHR[si];
                                g += pixelsHR[si + 1];
                                b += pixelsHR[si + 2];
                                a += pixelsHR[si + 3];
                            }
                        }

                        const count = samples * samples;
                        const di = (y * width + x) * 4;

                        imageData.data[di] = Math.round(r / count);
                        imageData.data[di + 1] = Math.round(g / count);
                        imageData.data[di + 2] = Math.round(b / count);
                        imageData.data[di + 3] = Math.round(a / count);
                    }
                }

                // Nettoyer
                renderTarget.dispose();
                tempLights.forEach(light => {
                    scene.remove(light);
                    light.dispose();
                });

                // Restaurer l'état
                renderer.setRenderTarget(null);
                renderer.setSize(width, height);
                scene.background = originalBackground;
                renderer.shadowMap.enabled = originalShadows;
                renderer.toneMapping = originalToneMapping;
                renderer.toneMappingExposure = originalExposure;
                threeCamera.position.copy(originalPosition);
                if (sceneRef.current.controls) {
                    sceneRef.current.controls.target.copy(originalTarget);
                }

                console.log('✅ High-quality frame captured');
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
        const threeCamera = new THREE.PerspectiveCamera(50, aspect, 0.01, 1000);
        threeCamera.position.set(10, 10, 10);

        // Renderer avec paramètres optimisés
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: true,
            powerPreference: "high-performance"
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1;
        currentMount.appendChild(renderer.domElement);

        // Controls
        const controls = new OrbitControls(threeCamera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 0.1;
        controls.maxDistance = 100;

        // Éclairage équilibré
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -10;
        directionalLight.shadow.camera.right = 10;
        directionalLight.shadow.camera.top = 10;
        directionalLight.shadow.camera.bottom = -10;
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

    // Update model
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
                side: THREE.DoubleSide // Important pour certains modèles
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
            // Centrage et scaling
            const box = new THREE.Box3().setFromObject(modelGroup);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());

            modelGroup.position.sub(center);

            const maxDimension = Math.max(size.x, size.y, size.z);
            if (maxDimension > 10) {
                const scale = 8 / maxDimension;
                modelGroup.scale.setScalar(scale);
                console.log(`📏 Model scaled by: ${scale.toFixed(2)}`);
            }

            scene.add(modelGroup);
            sceneRef.current.currentModel = modelGroup;

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