// ui/contexts/AppContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import {
    Model3D,
    Camera,
    RenderSettings,
    PixelSettings,
    ExportSettings,
    ProcessedFrame,
    CameraPreset,
} from '@shared/types';
import { CameraManager, PresetFactory } from '@core/camera-system';
import { PalettePresets } from '@core/pixel-processor/palettes/PalettePresets';

interface AppContextValue {
    // Model
    model: Model3D | null;
    setModel: (model: Model3D | null) => void;

    // Camera
    camera: Camera;
    setCamera: (camera: Camera) => void;
    cameraPresets: CameraPreset[];
    selectedPresetId: string | null;
    applyPreset: (presetId: string) => void;

    // Settings
    renderSettings: RenderSettings;
    setRenderSettings: (settings: Partial<RenderSettings>) => void;
    pixelSettings: PixelSettings;
    setPixelSettings: (settings: Partial<PixelSettings>) => void;
    exportSettings: ExportSettings;
    setExportSettings: (settings: Partial<ExportSettings>) => void;

    // Processed frames
    processedFrames: ProcessedFrame[];
    setProcessedFrames: (frames: ProcessedFrame[]) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useAppContext() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within AppProvider');
    }
    return context;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
    // Initialize camera manager and presets
    const [cameraManager] = useState(() => {
        const manager = new CameraManager({
            position: { x: 10, y: 10, z: 10 },
            rotation: { x: -0.353, y: 0.353, z: 0.146, w: 0.853 },
            fov: 30,
            near: 0.1,
            far: 100,
            type: 'perspective',
        });

        // Register all presets
        const presets = PresetFactory.createAll();
        presets.forEach((preset, id) => {
            manager.registerPreset(id, preset);
        });

        return manager;
    });

    // Get camera presets info
    const cameraPresets = Array.from(cameraManager.getPresets().values()).map(p => p.getInfo());

    // State
    const [model, setModel] = useState<Model3D | null>(null);
    const [camera, setCameraState] = useState<Camera>(cameraManager.getCamera());
    const [selectedPresetId, setSelectedPresetId] = useState<string | null>('pokemon');
    const [processedFrames, setProcessedFrames] = useState<ProcessedFrame[]>([]);

    const [renderSettings, setRenderSettingsState] = useState<RenderSettings>({
        camera: cameraManager.getCamera(),
        lights: [
            {
                type: 'ambient',
                color: { r: 255, g: 255, b: 255, a: 255 },
                intensity: 0.6,
            },
            {
                type: 'directional',
                color: { r: 255, g: 255, b: 255, a: 255 },
                intensity: 0.8,
                position: { x: 5, y: 5, z: 5 },
            },
        ],
        backgroundColor: { r: 135, g: 206, b: 235, a: 255 },
        antialias: true,
        shadows: false,
    });

    const [pixelSettings, setPixelSettingsState] = useState<PixelSettings>({
        targetSize: { width: 64, height: 64 },
        pixelScale: 4,
        colorPalette: PalettePresets.pico8,
        dithering: false,
        ditheringStrength: 0.1,
        contrastBoost: 0,
        brightnessAdjust: 0,
    });

    const [exportSettings, setExportSettingsState] = useState<ExportSettings>({
        format: 'png',
        layout: {
            type: 'grid',
            spacing: 2,
            padding: 4,
        },
        scale: 1,
        includeMetadata: true,
        transparent: true,
    });

    // Camera management
    const setCamera = useCallback((newCamera: Camera) => {
        cameraManager.setCamera(newCamera);
        setCameraState(newCamera);
        setRenderSettingsState(prev => ({ ...prev, camera: newCamera }));
    }, [cameraManager]);

    const applyPreset = useCallback((presetId: string) => {
        cameraManager.applyPreset(presetId, 500); // 500ms transition
        setSelectedPresetId(presetId);

        // Get preset settings
        const preset = cameraManager.getPresets().get(presetId);
        if (preset) {
            const renderPreset = preset.getRenderSettings();
            const pixelPreset = preset.getPixelSettings();

            setRenderSettingsState(prev => ({ ...prev, ...renderPreset }));
            setPixelSettingsState(prev => ({ ...prev, ...pixelPreset }));
        }

        // Update camera state after transition
        setTimeout(() => {
            setCameraState(cameraManager.getCamera());
        }, 500);
    }, [cameraManager]);

    // Settings updates
    const setRenderSettings = useCallback((settings: Partial<RenderSettings>) => {
        setRenderSettingsState(prev => ({ ...prev, ...settings }));
    }, []);

    const setPixelSettings = useCallback((settings: Partial<PixelSettings>) => {
        setPixelSettingsState(prev => ({ ...prev, ...settings }));
    }, []);

    const setExportSettings = useCallback((settings: Partial<ExportSettings>) => {
        setExportSettingsState(prev => ({ ...prev, ...settings }));
    }, []);

    const value: AppContextValue = {
        model,
        setModel,
        camera,
        setCamera,
        cameraPresets,
        selectedPresetId,
        applyPreset,
        renderSettings,
        setRenderSettings,
        pixelSettings,
        setPixelSettings,
        exportSettings,
        setExportSettings,
        processedFrames,
        setProcessedFrames,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}