// ui/components/viewers/ModelViewer3D/ModelViewer3D.tsx (Corrected & Robust)
import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { Model3D, Camera } from '@shared/types';
import { ModelViewerSceneManager } from '@rendering/three-renderer/ModelViewerSceneManager';

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
    playAnimation: (animationName: string) => void;
    pauseAnimation: () => void;
    resetAnimation: () => void;
    getAnimations: () => string[];
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
    const sceneManagerRef = useRef<ModelViewerSceneManager | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Initialisation unique du SceneManager au montage
    useEffect(() => {
        if (mountRef.current && !sceneManagerRef.current) {
            const manager = new ModelViewerSceneManager(mountRef.current, camera, onCameraChange);
            sceneManagerRef.current = manager;
        }
        return () => {
            if (sceneManagerRef.current) {
                sceneManagerRef.current.dispose();
                sceneManagerRef.current = null;
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Dépendances vides pour garantir une exécution unique

    // Effet séparé pour mettre à jour le callback si la prop change, sans recréer la scène.
    useEffect(() => {
        sceneManagerRef.current?.updateCallbacks(onCameraChange);
    }, [onCameraChange]);

    useImperativeHandle(ref, () => ({
        captureFrame: () => sceneManagerRef.current?.captureFrame() ?? null,
        playAnimation: (_name: string) => sceneManagerRef.current?.playAnimation(_name),
        pauseAnimation: () => sceneManagerRef.current?.pauseAnimation(),
        resetAnimation: () => sceneManagerRef.current?.resetAnimation(),
        getAnimations: () => sceneManagerRef.current?.getAnimations() ?? [],
    }), []);

    useEffect(() => {
        if (sceneManagerRef.current) {
            setIsLoading(true);
            setTimeout(() => {
                if (sceneManagerRef.current) { // Re-check in case component unmounted
                    sceneManagerRef.current.loadModel(model);
                }
                setIsLoading(false);
            }, 50);
        }
    }, [model]);

    useEffect(() => {
        sceneManagerRef.current?.updateCamera(camera);
    }, [camera]);

    useEffect(() => {
        sceneManagerRef.current?.toggleHelpers(showHelpers);
    }, [showHelpers]);

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
            {!model && !isLoading && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    No model loaded
                </div>
            )}
        </div>
    );
});
ModelViewer3D.displayName = 'ModelViewer3D';
