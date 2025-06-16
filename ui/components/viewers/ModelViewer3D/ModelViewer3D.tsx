// ui/components/viewers/ModelViewer3D/ModelViewer3D.tsx - Version corrigée
import { useEffect, useRef, useState } from 'react';
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

export function ModelViewer3D({
                                  model,
                                  camera,
                                  width = 400,
                                  height = 400,
                                  showHelpers = false,
                                  onCameraChange,
                              }: ModelViewer3DProps) {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<{
        scene: THREE.Scene;
        camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
        renderer: THREE.WebGLRenderer;
        controls: OrbitControls;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const currentMount = mountRef.current;
        if (!currentMount) return;

        // Initialize Three.js scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1a1a);

        // Create camera with CORRECTED parameters
        const aspect = width / height;
        let threeCamera: THREE.PerspectiveCamera | THREE.OrthographicCamera;

        if (camera.type === 'perspective') {
            threeCamera = new THREE.PerspectiveCamera(
                camera.fov,
                aspect,
                0.01, // CORRECTION: near plane plus proche (au lieu de camera.near)
                1000  // CORRECTION: far plane plus loin
            );
        } else {
            const size = camera.orthographicSize || 10;
            threeCamera = new THREE.OrthographicCamera(
                -size * aspect / 2,
                size * aspect / 2,
                size / 2,
                -size / 2,
                0.01, // CORRECTION: near plane plus proche
                1000  // CORRECTION: far plane plus loin
            );
        }

        threeCamera.position.set(camera.position.x, camera.position.y, camera.position.z);
        threeCamera.quaternion.set(camera.rotation.x, camera.rotation.y, camera.rotation.z, camera.rotation.w);

        // Create renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        currentMount.appendChild(renderer.domElement);

        // Add controls with CORRECTED limits
        const controls = new OrbitControls(threeCamera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        // CORRECTION: Limites de zoom plus larges
        controls.minDistance = 0.1;  // Zoom très proche
        controls.maxDistance = 100;  // Zoom très loin
        controls.minZoom = 0.1;      // Pour orthographique
        controls.maxZoom = 10;       // Pour orthographique

        controls.addEventListener('change', () => {
            if (onCameraChange) {
                onCameraChange({
                    ...camera,
                    position: {
                        x: threeCamera.position.x,
                        y: threeCamera.position.y,
                        z: threeCamera.position.z,
                    },
                    rotation: {
                        x: threeCamera.quaternion.x,
                        y: threeCamera.quaternion.y,
                        z: threeCamera.quaternion.z,
                        w: threeCamera.quaternion.w,
                    },
                });
            }
        });

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);

        // Add helpers if requested
        if (showHelpers) {
            const gridHelper = new THREE.GridHelper(10, 10, 0x888888, 0x444444);
            scene.add(gridHelper);

            const axesHelper = new THREE.AxesHelper(2); // CORRECTION: Axes plus petits
            scene.add(axesHelper);
        }

        sceneRef.current = { scene, camera: threeCamera, renderer, controls };

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, threeCamera);
        };
        animate();

        return () => {
            if (currentMount && renderer.domElement) {
                currentMount.removeChild(renderer.domElement);
            }
            renderer.dispose();
            controls.dispose();
        };
    }, [width, height, showHelpers, camera, onCameraChange]);

    // Update model
    useEffect(() => {
        if (!sceneRef.current || !model) return;

        setIsLoading(true);
        const { scene } = sceneRef.current;

        // Remove existing models
        const modelsToRemove = scene.children.filter(
            child => child.userData.isModel
        );
        modelsToRemove.forEach(child => scene.remove(child));

        // Add new model
        const modelGroup = new THREE.Group();
        modelGroup.userData.isModel = true;

        // CORRECTION: Create materials avec textures
        const materials = new Map<string, THREE.Material>();
        model.materials.forEach(mat => {
            const material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(mat.color.r / 255, mat.color.g / 255, mat.color.b / 255),
                opacity: mat.opacity,
                transparent: mat.opacity < 1,
                metalness: mat.metalness || 0,
                roughness: mat.roughness || 0.8, // CORRECTION: Roughness plus réaliste
            });

            // CORRECTION: Chargement des textures si disponibles
            if (mat.texture && mat.texture.url) {
                const textureLoader = new THREE.TextureLoader();
                textureLoader.load(
                    mat.texture.url,
                    (texture) => {
                        material.map = texture;
                        material.needsUpdate = true;
                    },
                    undefined,
                    (error) => {
                        console.warn('Failed to load texture:', error);
                    }
                );
            }

            materials.set(mat.id, material);
        });

        // Create meshes
        model.meshes.forEach(mesh => {
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(mesh.vertices, 3));
            geometry.setAttribute('normal', new THREE.BufferAttribute(mesh.normals, 3));
            geometry.setAttribute('uv', new THREE.BufferAttribute(mesh.uvs, 2));

            if (mesh.indices) {
                geometry.setIndex(new THREE.BufferAttribute(mesh.indices, 1));
            }

            const material = mesh.materialId
                ? materials.get(mesh.materialId)
                : new THREE.MeshStandardMaterial({ color: 0x888888 });

            const threeMesh = new THREE.Mesh(geometry, material || new THREE.MeshStandardMaterial());
            threeMesh.name = mesh.name;
            modelGroup.add(threeMesh);
        });

        // CORRECTION: Centrage et mise à l'échelle intelligente
        const box = new THREE.Box3().setFromObject(modelGroup);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // Centrer le modèle
        modelGroup.position.sub(center);

        // CORRECTION: Ajuster la taille si le modèle est trop grand/petit
        const maxDimension = Math.max(size.x, size.y, size.z);
        if (maxDimension > 10) {
            const scale = 10 / maxDimension;
            modelGroup.scale.setScalar(scale);
        }

        scene.add(modelGroup);
        setIsLoading(false);
    }, [model]);

    // Update camera
    useEffect(() => {
        if (!sceneRef.current) return;

        const { camera: threeCamera } = sceneRef.current;
        threeCamera.position.set(camera.position.x, camera.position.y, camera.position.z);
        threeCamera.quaternion.set(camera.rotation.x, camera.rotation.y, camera.rotation.z, camera.rotation.w);
    }, [camera]);

    return (
        <div className="relative" style={{ width, height }}>
            <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="text-white">Loading model...</div>
                </div>
            )}
            {!model && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    No model loaded
                </div>
            )}
        </div>
    );
}