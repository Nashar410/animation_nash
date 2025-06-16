// src/App.tsx - Version avec interface améliorée
import { useState, useCallback, useEffect } from 'react';
import { AppProvider, useAppContext } from '../ui/contexts/AppContext';
import {
  ModelViewer3D,
  PixelPreview,
  FileUpload,
  PresetSelector,
  SettingsPanel,
} from '@ui/components';
import { useModelLoader } from "@ui/hooks/useModelLoader";
import { usePixelProcessor } from "@ui/hooks/usePixelProcessor";
import { useExporter } from "@ui/hooks/useExporter";
import { ThreeRenderer } from '@rendering/three-renderer';
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
    renderSettings,
    pixelSettings,
    setPixelSettings,
    exportSettings,
    setExportSettings,
    processedFrames,
    setProcessedFrames,
  } = useAppContext();

  const { loadModel, isLoading: modelLoading, error: modelError } = useModelLoader();
  const { processImage, isProcessing } = usePixelProcessor();
  const { exportFrames, isExporting } = useExporter();

  const [renderer] = useState(() => new ThreeRenderer());
  const [activeTab, setActiveTab] = useState<'model' | 'settings'>('model');
  const [showGrid, setShowGrid] = useState(true);

  // Handle file upload
  const handleFileSelect = useCallback(async (file: File) => {
    const loadedModel = await loadModel(file);
    if (loadedModel !== null) {
      setModel(loadedModel);
    }
  }, [loadModel, setModel]);

  // Process current view
  const handleProcess = useCallback(async () => {
    if (!model) return;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;

    renderer.initialize(canvas);
    renderer.updateSettings(renderSettings);

    const result = renderer.render(model, camera);
    const processed = await processImage(result.image, pixelSettings);
    if (processed) {
      setProcessedFrames([processed]);
    }
  }, [model, camera, renderSettings, pixelSettings, renderer, processImage, setProcessedFrames]);

  // Export spritesheet
  const handleExport = useCallback(async () => {
    if (processedFrames.length === 0) return;
    await exportFrames(processedFrames, exportSettings);
  }, [processedFrames, exportSettings, exportFrames]);

  // Auto-process on settings change
  useEffect(() => {
    if (model) {
      handleProcess();
    }
  }, [pixelSettings.targetSize, pixelSettings.colorPalette, handleProcess, model]);

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
                      Transform 3D models into retro game sprites
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
                      title="Toggle grid"
                  >
                    <Grid3x3 className="w-5 h-5" />
                  </button>
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
                      Powered by Three.js & Advanced Algorithms
                    </div>

                    <h2 className="text-5xl md:text-6xl font-bold text-white leading-tight">
                      Create Epic
                      <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                    Pixel Art Sprites
                  </span>
                    </h2>

                    <p className="text-xl text-purple-100 max-w-2xl mx-auto leading-relaxed">
                      Upload your 3D models and instantly convert them to beautiful pixel art
                      with classic retro game aesthetics. Perfect for indie game developers!
                    </p>
                  </div>

                  {/* Features Grid */}
                  <div className="grid md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                      <Camera className="w-12 h-12 text-purple-400 mb-4 mx-auto" />
                      <h3 className="text-lg font-semibold text-white mb-2">Game Presets</h3>
                      <p className="text-purple-100 text-sm">
                        Pokémon, Final Fantasy, Zelda-style camera angles ready to use
                      </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                      <Palette className="w-12 h-12 text-pink-400 mb-4 mx-auto" />
                      <h3 className="text-lg font-semibold text-white mb-2">Retro Palettes</h3>
                      <p className="text-purple-100 text-sm">
                        Game Boy, NES, PICO-8 color palettes for authentic retro vibes
                      </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                      <Download className="w-12 h-12 text-blue-400 mb-4 mx-auto" />
                      <h3 className="text-lg font-semibold text-white mb-2">Export Ready</h3>
                      <p className="text-purple-100 text-sm">
                        PNG, WebP spritesheets with metadata for your game engine
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
                                    onPresetSelect={applyPreset}
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
                            model={model}
                            camera={camera}
                            width={400}
                            height={400}
                            showHelpers={showGrid}
                            onCameraChange={setCamera}
                        />
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