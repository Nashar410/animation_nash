// src/App.tsx - Version avec nouvel algorithme de pixel art
import { useState, useCallback, useEffect, useRef } from 'react';
import { AppProvider, useAppContext } from '../ui/contexts/AppContext';
import {
  ModelViewer3D,
  PixelPreview,
  FileUpload,
  PresetSelector,
  SettingsPanel,
} from '@ui/components';
import { AnimationSelector } from '@ui/components/controls/AnimationSelector/AnimationSelector';
import { useModelLoader } from "@ui/hooks/useModelLoader";
import { useExporter } from "@ui/hooks/useExporter";
import { PixelArtAlgorithm } from '@core/pixel-processor/algorithms/PixelArtAlgorithm';
import {
  Download,
  Settings,
  Camera,
  Grid3x3,
  Upload,
  Gamepad2,
  Palette,
  Sparkles,
  Zap,
  Github,
  Heart
} from 'lucide-react';

function AppContent() {
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
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(false);
  const [availableAnimations, setAvailableAnimations] = useState<string[]>([]);

  // Référence vers le ModelViewer3D pour capturer ses frames
  const modelViewerRef = useRef<{
    captureFrame: () => ImageData | null;
    playAnimation: (animationName: string) => void;
    pauseAnimation: () => void;
    resetAnimation: () => void;
    getAnimations: () => string[];
  } | null>(null);

  // AMÉLIORATION: Utiliser le nouvel algorithme professionnel
  const pixelAlgorithmRef = useRef(new PixelArtAlgorithm());

  // Handle file upload
  const handleFileSelect = useCallback(async (file: File) => {
    const loadedModel = await loadModel(file);
    if (loadedModel !== null) {
      setModel(loadedModel);

      // Réinitialiser l'état des animations
      setCurrentAnimation(null);
      setIsAnimationPlaying(false);
      setAvailableAnimations([]);
    }
  }, [loadModel, setModel]);

  // Process pixel art avec le nouvel algorithme
  const processPixelArt = useCallback((imageData: ImageData) => {
    const startTime = performance.now();

    try {
      console.log('🎨 Processing with professional pixel art algorithm...');

      // Utiliser le nouvel algorithme professionnel
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
      console.log(`✅ Professional pixel art processed in ${processingTime.toFixed(2)}ms`);

      return processedFrame;
    } catch (error) {
      console.error('❌ Pixel processing error:', error);
      return null;
    }
  }, [pixelSettings, setProcessedFrames]);

  // Process complet : capture + pixel art
  const handleProcess = useCallback(async () => {
    if (!model || !modelViewerRef.current) {
      console.warn('⚠️ Missing model or model viewer');
      return;
    }

    setIsProcessing(true);

    try {
      console.log('📸 Starting high-quality capture and processing...');

      // Capturer l'image du ModelViewer3D avec la nouvelle méthode améliorée
      const imageData = modelViewerRef.current.captureFrame();
      if (!imageData) {
        console.error('❌ Failed to capture frame');
        return;
      }

      console.log('✅ High-quality frame captured, processing pixel art...');

      // Traiter avec le nouvel algorithme professionnel
      processPixelArt(imageData);

    } catch (error) {
      console.error('❌ Processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [model, processPixelArt]);

  // Export spritesheet
  const handleExport = useCallback(async () => {
    if (processedFrames.length === 0) return;
    await exportFrames(processedFrames, exportSettings);
  }, [processedFrames, exportSettings, exportFrames]);

  // Auto-process quand le modèle ou les settings changent
  useEffect(() => {
    if (!model) return;

    const timeoutId = setTimeout(() => {
      handleProcess();
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [model, pixelSettings.targetSize, pixelSettings.colorPalette, selectedPresetId]);

  // Process manuel sur changement de preset
  const handlePresetChange = useCallback((presetId: string) => {
    applyPreset(presetId);
  }, [applyPreset]);

  // Gestion des animations
  const handleAnimationSelect = useCallback((animationName: string) => {
    if (modelViewerRef.current) {
      modelViewerRef.current.playAnimation(animationName);
      setCurrentAnimation(animationName);
      setIsAnimationPlaying(true);
    }
  }, []);

  const handlePlayPause = useCallback(() => {
    if (modelViewerRef.current) {
      modelViewerRef.current.pauseAnimation();
      setIsAnimationPlaying(!isAnimationPlaying);
    }
  }, [isAnimationPlaying]);

  const handleAnimationReset = useCallback(() => {
    if (modelViewerRef.current) {
      modelViewerRef.current.resetAnimation();
    }
  }, []);

  // Mettre à jour la liste des animations quand le modèle change
  useEffect(() => {
    if (model && modelViewerRef.current) {
      setTimeout(() => {
        const animations = modelViewerRef.current?.getAnimations() || [];
        setAvailableAnimations(animations);
        console.log(`📋 Available animations: ${animations.join(', ')}`);
      }, 500); // Petit délai pour s'assurer que le modèle est chargé
    }
  }, [model]);

  return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>

        <div className="relative z-10">
          {/* Header */}
          <header className="backdrop-blur-md bg-white/10 border-b border-white/20 shadow-2xl">
            <div className="container mx-auto px-4 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                    <Gamepad2 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-200 via-pink-200 to-blue-200 bg-clip-text text-transparent">
                      3D → Pixel Art Converter
                    </h1>
                    <p className="text-purple-200 text-sm flex items-center">
                      <Sparkles className="w-4 h-4 mr-1" />
                      Professional quality pixel art from 3D models
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                      onClick={() => setShowGrid(!showGrid)}
                      className={`p-3 rounded-xl transition-all duration-200 ${
                          showGrid
                              ? 'bg-purple-500/20 text-purple-200 shadow-lg'
                              : 'bg-white/10 text-white/60 hover:bg-white/20'
                      }`}
                      title={`${showGrid ? 'Hide' : 'Show'} grid helpers`}
                  >
                    <Grid3x3 className="w-5 h-5" />
                  </button>

                  {!model && (
                      <div className="text-xs text-white/60">
                        Grid: {showGrid ? 'ON' : 'OFF'}
                      </div>
                  )}
                  <a
                      href="https://github.com"
                      className="p-3 rounded-xl bg-white/10 text-white/80 hover:bg-white/20 transition-all duration-200"
                      title="View on GitHub"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </header>

          <main className="container mx-auto px-4 py-8">
            {!model ? (
                // Landing Page
                <div className="max-w-4xl mx-auto text-center space-y-12">
                  {/* Hero Section */}
                  <div className="space-y-6">
                    <div className="inline-flex items-center px-4 py-2 bg-purple-500/20 border border-purple-300/30 rounded-full text-purple-200 text-sm">
                      <Zap className="w-4 h-4 mr-2" />
                      Professional Pixel Art Algorithm - Blender Quality
                    </div>

                    <h2 className="text-5xl md:text-6xl font-bold text-white leading-tight">
                      Create Epic
                      <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                    Pixel Art Sprites
                  </span>
                    </h2>

                    <p className="text-xl text-purple-100 max-w-2xl mx-auto leading-relaxed">
                      Upload your 3D models and instantly convert them to beautiful pixel art
                      with professional-grade algorithms. Perfect for indie game developers!
                    </p>
                  </div>

                  {/* Features Grid */}
                  <div className="grid md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                      <Camera className="w-12 h-12 text-purple-400 mb-4 mx-auto" />
                      <h3 className="text-lg font-semibold text-white mb-2">Smart Auto-Framing</h3>
                      <p className="text-purple-100 text-sm">
                        Intelligent model centering and optimal camera positioning
                      </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                      <Palette className="w-12 h-12 text-pink-400 mb-4 mx-auto" />
                      <h3 className="text-lg font-semibold text-white mb-2">Pro Algorithms</h3>
                      <p className="text-purple-100 text-sm">
                        Advanced noise reduction and edge-preserving techniques
                      </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                      <Download className="w-12 h-12 text-blue-400 mb-4 mx-auto" />
                      <h3 className="text-lg font-semibold text-white mb-2">Clean Output</h3>
                      <p className="text-purple-100 text-sm">
                        Artifact-free pixel art ready for your game engine
                      </p>
                    </div>
                  </div>

                  {/* Upload Section */}
                  <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl max-w-2xl mx-auto">
                    <div className="mb-6">
                      <Upload className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-white mb-2">Upload Your 3D Model</h3>
                      <p className="text-purple-200">
                        Supports GLB and GLTF formats up to 50MB
                      </p>
                    </div>

                    <FileUpload
                        accept=".glb,.gltf"
                        onFileSelect={handleFileSelect}
                        maxSize={50}
                    />

                    {modelLoading && (
                        <div className="mt-4 flex items-center justify-center text-purple-200">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400 mr-3"></div>
                          Loading your model...
                        </div>
                    )}

                    {modelError && (
                        <div className="mt-4 p-4 bg-red-500/20 border border-red-300/30 rounded-xl text-red-200">
                          Error: {modelError.message}
                        </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="text-center text-purple-300 text-sm">
                    <p className="flex items-center justify-center">
                      Made with <Heart className="w-4 h-4 mx-1 text-pink-400" /> for indie game developers
                    </p>
                  </div>
                </div>
            ) : (
                // Main App Interface
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Panel - Model/Settings */}
                  <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20">
                      <div className="flex border-b border-white/20">
                        <button
                            onClick={() => setActiveTab('model')}
                            className={`flex-1 px-6 py-4 font-medium transition-all duration-200 ${
                                activeTab === 'model'
                                    ? 'text-purple-200 bg-purple-500/20 border-b-2 border-purple-400'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                            }`}
                        >
                          <Camera className="w-4 h-4 inline mr-2" />
                          Camera
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`flex-1 px-6 py-4 font-medium transition-all duration-200 ${
                                activeTab === 'settings'
                                    ? 'text-purple-200 bg-purple-500/20 border-b-2 border-purple-400'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                            }`}
                        >
                          <Settings className="w-4 h-4 inline mr-2" />
                          Settings
                        </button>
                      </div>

                      <div className="p-6">
                        {activeTab === 'model' ? (
                            <div className="space-y-6">
                              <div>
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                  <Gamepad2 className="w-5 h-5 mr-2 text-purple-400" />
                                  Game Style Presets
                                </h3>
                                <PresetSelector
                                    presets={cameraPresets}
                                    selectedPresetId={selectedPresetId}
                                    onPresetSelect={handlePresetChange}
                                />
                              </div>

                              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                <p className="text-sm text-purple-200 mb-2">
                                  <strong>Model Info:</strong> {model.meshes.length} meshes, {model.animations.length} animations
                                </p>
                                <button
                                    onClick={() => setModel(null)}
                                    className="text-sm text-red-300 hover:text-red-200 transition-colors"
                                >
                                  ← Load different model
                                </button>
                              </div>

                              {/* Animation Selector */}
                              {model.animations.length > 0 && (
                                  <div className="mt-6">
                                    <AnimationSelector
                                        animations={availableAnimations}
                                        currentAnimation={currentAnimation}
                                        isPlaying={isAnimationPlaying}
                                        onAnimationSelect={handleAnimationSelect}
                                        onPlayPause={handlePlayPause}
                                        onReset={handleAnimationReset}
                                    />
                                  </div>
                              )}
                            </div>
                        ) : (
                            <SettingsPanel
                                pixelSettings={pixelSettings}
                                exportSettings={exportSettings}
                                onPixelSettingsChange={setPixelSettings}
                                onExportSettingsChange={setExportSettings}
                            />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Center - 3D Viewer */}
                  <div className="lg:col-span-1">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20">
                      <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                        <Camera className="w-5 h-5 mr-2 text-blue-400" />
                        3D Model Preview
                      </h2>
                      <div className="rounded-xl overflow-hidden border border-white/20">
                        <ModelViewer3D
                            ref={modelViewerRef}
                            model={model}
                            camera={camera}
                            width={400}
                            height={400}
                            showHelpers={showGrid}
                            onCameraChange={setCamera}
                        />
                      </div>
                      <div className="mt-4 text-center">
                        <p className="text-xs text-purple-200">
                          Drag to rotate • Scroll to zoom • Double-click to reset
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right - Pixel Preview */}
                  <div className="lg:col-span-1">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20">
                      <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                        <Palette className="w-5 h-5 mr-2 text-pink-400" />
                        Pixel Art Result
                      </h2>
                      <div className="flex justify-center">
                        <div className="rounded-xl overflow-hidden border border-white/20 bg-gray-900/50">
                          <PixelPreview
                              frame={processedFrames[0] || null}
                              scale={4}
                              showGrid={showGrid}
                          />
                        </div>
                      </div>
                      <div className="mt-4 text-center">
                        <div className="text-xs text-purple-200 space-y-1">
                          <p>Resolution: {pixelSettings.targetSize.width} × {pixelSettings.targetSize.height}</p>
                          <p>Algorithm: Professional Pixel Art (v2)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            )}

            {/* Action Buttons - Only show when model is loaded */}
            {model && (
                <div className="mt-8 flex justify-center space-x-4">
                  <button
                      onClick={handleProcess}
                      disabled={!model || isProcessing}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 disabled:text-gray-400 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl transform transition-all duration-200 hover:scale-105 disabled:hover:scale-100 flex items-center"
                  >
                    {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          Processing...
                        </>
                    ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Generate Pixel Art
                        </>
                    )}
                  </button>

                  <button
                      onClick={handleExport}
                      disabled={processedFrames.length === 0 || isExporting}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 disabled:text-gray-400 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl transform transition-all duration-200 hover:scale-105 disabled:hover:scale-100 flex items-center"
                  >
                    {isExporting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          Exporting...
                        </>
                    ) : (
                        <>
                          <Download className="w-5 h-5 mr-2" />
                          Download Spritesheet
                        </>
                    )}
                  </button>
                </div>
            )}

            {/* Processing Info */}
            {model && processedFrames.length > 0 && (
                <div className="mt-6 text-center">
                  <div className="inline-flex items-center px-4 py-2 bg-green-500/20 border border-green-300/30 rounded-full text-green-200 text-sm">
                    ✅ Pixel art generated in {processedFrames[0].processingTime.toFixed(0)}ms
                  </div>
                </div>
            )}
          </main>
        </div>
      </div>
  );
}

function App() {
  return (
      <AppProvider>
        <AppContent />
      </AppProvider>
  );
}

export default App;