// ui/hooks/useAppEngine.ts
import { useState, useCallback, useEffect, useRef, RefObject } from 'react';
import { useAppContext } from '@ui/contexts/AppContext';
import { useModelLoader } from '@ui/hooks/useModelLoader';
import { useExporter } from '@ui/hooks/useExporter';
import { PixelArtAlgorithm } from '@core/pixel-processor/algorithms/PixelArtAlgorithm';

// Interface pour la référence du ModelViewer3D, pour un typage fort
export interface ModelViewerRef {
  captureFrame: () => ImageData | null;
  playAnimation: (animationName: string) => void;
  pauseAnimation: () => void;
  resetAnimation: () => void;
  getAnimations: () => string[];
}

export const useAppEngine = (modelViewerRef: RefObject<ModelViewerRef>) => {
  const {
    model,
    setModel,
    camera,
    setCamera,
    cameraPresets,
    selectedPresetId,
    applyPreset,
    pixelSettings,
    setPixelSettings,
    exportSettings,
    setExportSettings,
    processedFrames,
    setProcessedFrames,
  } = useAppContext();

  const { loadModel, isLoading: modelLoading, error: modelError } = useModelLoader();
  const { exportFrames, isExporting } = useExporter();

  const [activeTab, setActiveTab] = useState<'model' | 'settings'>('model');
  const [showGrid, setShowGrid] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState<string | null>(null);
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(true);
  const [availableAnimations, setAvailableAnimations] = useState<string[]>([]);

  const pixelAlgorithmRef = useRef(new PixelArtAlgorithm());

  const handleFileSelect = useCallback(async (file: File) => {
    const loadedModel = await loadModel(file);
    if (loadedModel !== null) {
      setModel(loadedModel);
      setCurrentAnimation(null);
      setIsAnimationPlaying(false);
      setAvailableAnimations([]);
    }
  }, [loadModel, setModel]);

  const processPixelArt = useCallback((imageData: ImageData) => {
    const startTime = performance.now();
    try {
      const processedImageData = pixelAlgorithmRef.current.apply(imageData, pixelSettings);
      const processingTime = performance.now() - startTime;
      const processedFrame = {
        id: `frame_${Date.now()}`,
        original: imageData,
        processed: processedImageData,
        frameNumber: 0,
        processingTime,
      };
      setProcessedFrames([processedFrame]);
      console.log(`✅ Pixel art processed in ${processingTime.toFixed(2)}ms`);
      return processedFrame;
    } catch (error) {
      console.error('❌ Pixel processing error:', error);
      return null;
    }
  }, [pixelSettings, setProcessedFrames]);

  const handleProcess = useCallback(async () => {
    if (!model || !modelViewerRef.current) return;
    setIsProcessing(true);
    try {
      const imageData = modelViewerRef.current.captureFrame();
      if (!imageData) {
        console.error('❌ Failed to capture frame');
        setIsProcessing(false);
        return;
      }
      processPixelArt(imageData);
    } catch (error) {
      console.error('❌ Processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [model, modelViewerRef, processPixelArt]);

  const handleExport = useCallback(async () => {
    if (processedFrames.length === 0) return;
    await exportFrames(processedFrames, exportSettings);
  }, [processedFrames, exportSettings, exportFrames]);

  const handlePresetChange = useCallback((presetId: string) => {
    applyPreset(presetId);
  }, [applyPreset]);

  const handleAnimationSelect = useCallback((animationName: string) => {
    if (modelViewerRef.current) {
      modelViewerRef.current.playAnimation(animationName);
      setCurrentAnimation(animationName);
      setIsAnimationPlaying(true);
    }
  }, [modelViewerRef]);

  const handlePlayPause = useCallback(() => {
    if (modelViewerRef.current) {
      if (isAnimationPlaying) {
          modelViewerRef.current.pauseAnimation();
      } else if(currentAnimation) {
          modelViewerRef.current.playAnimation(currentAnimation);
      }
      setIsAnimationPlaying(!isAnimationPlaying);
    }
  }, [isAnimationPlaying, currentAnimation, modelViewerRef]);

  const handleAnimationReset = useCallback(() => {
    if (modelViewerRef.current) {
      modelViewerRef.current.resetAnimation();
    }
  }, [modelViewerRef]);

  useEffect(() => {
    if (!model) return;
    const timeoutId = setTimeout(() => handleProcess(), 800);
    return () => clearTimeout(timeoutId);
  }, [model, pixelSettings.targetSize, pixelSettings.colorPalette, selectedPresetId, handleProcess]);

  useEffect(() => {
    if (model && modelViewerRef.current) {
      setTimeout(() => {
        const animations = modelViewerRef.current?.getAnimations() || [];
        setAvailableAnimations(animations);
      }, 500);
    }
  }, [model, modelViewerRef]);

  return {
    // From Context
    model, setModel, camera, setCamera, cameraPresets, selectedPresetId,
    pixelSettings, setPixelSettings, exportSettings, setExportSettings,
    processedFrames,
    // Local UI State
    activeTab, setActiveTab, showGrid, setShowGrid, isProcessing,
    currentAnimation, isAnimationPlaying, availableAnimations,
    // From other hooks
    modelLoading, modelError, isExporting,
    // Handlers
    handleFileSelect, handleProcess, handleExport, handlePresetChange,
    handleAnimationSelect, handlePlayPause, handleAnimationReset,
    applyPreset
  };
};
