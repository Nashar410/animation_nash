// src/App.tsx - Version entièrement corrigée
import { useState, useCallback, useEffect } from 'react';
import { AppProvider, useAppContext } from '../ui/contexts/AppContext';
import {
  ModelViewer3D,
  PixelPreview,
  FileUpload,
  PresetSelector,
  SettingsPanel,
} from '../ui/components';
import { useModelLoader } from "@ui/hooks/useModelLoader";
import { usePixelProcessor } from "@ui/hooks/usePixelProcessor";
import { useExporter } from "@ui/hooks/useExporter";
import { ThreeRenderer } from '@rendering/three-renderer';
import { Download, Settings, Camera, Grid3x3 } from 'lucide-react';

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

  const { loadModel } = useModelLoader();
  const { processImage, isProcessing } = usePixelProcessor();
  const { exportFrames, isExporting } = useExporter();

  const [renderer] = useState(() => new ThreeRenderer());
  const [activeTab, setActiveTab] = useState<'model' | 'settings'>('model');
  const [showGrid, setShowGrid] = useState(true);

  // Handle file upload
  const handleFileSelect = useCallback(async (file: File) => {
    const loadedModel = await loadModel(file);
    if (loadedModel !== null) { // Vérification explicite contre null
      setModel(loadedModel);
    }
  }, [loadModel, setModel]);

  // Process current view - useCallback avec toutes les dépendances
  const handleProcess = useCallback(async () => {
    if (!model) return;

    // Create render canvas
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;

    // Initialize renderer
    renderer.initialize(canvas);
    renderer.updateSettings(renderSettings);

    // Render frame
    const result = renderer.render(model, camera);

    // Process to pixel art
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

  // Auto-process on settings change - Dépendances corrigées
  useEffect(() => {
    if (model) {
      handleProcess();
    }
  }, [pixelSettings.targetSize, pixelSettings.colorPalette, handleProcess, model]);

  return (
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Header */}
        <header className="bg-gray-800 shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                  3D to Pixel Art Converter
                </h1>
                <p className="text-gray-400 text-sm">Transform 3D models into retro sprites</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                    onClick={() => setShowGrid(!showGrid)}
                    className="p-2 rounded hover:bg-gray-700 transition-colors"
                    title="Toggle grid"
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - Model/Settings */}
            <div className="lg:col-span-1 space-y-6">
              {!model ? (
                  <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
                    <h2 className="text-xl font-semibold mb-4">Upload Model</h2>
                    <FileUpload
                        accept=".glb,.gltf"
                        onFileSelect={handleFileSelect}
                        maxSize={50}
                    />
                  </div>
              ) : (
                  <div className="bg-gray-800 rounded-lg shadow-xl">
                    <div className="flex border-b border-gray-700">
                      <button
                          onClick={() => setActiveTab('model')}
                          className={`flex-1 px-4 py-3 font-medium transition-colors ${
                              activeTab === 'model'
                                  ? 'text-purple-400 border-b-2 border-purple-400'
                                  : 'text-gray-400 hover:text-white'
                          }`}
                      >
                        <Camera className="w-4 h-4 inline mr-2" />
                        View
                      </button>
                      <button
                          onClick={() => setActiveTab('settings')}
                          className={`flex-1 px-4 py-3 font-medium transition-colors ${
                              activeTab === 'settings'
                                  ? 'text-purple-400 border-b-2 border-purple-400'
                                  : 'text-gray-400 hover:text-white'
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
                              <h3 className="text-lg font-semibold mb-4">Camera Presets</h3>
                              <PresetSelector
                                  presets={cameraPresets}
                                  selectedPresetId={selectedPresetId}
                                  onPresetSelect={applyPreset}
                              />
                            </div>

                            <div>
                              <p className="text-sm text-gray-400 mb-2">
                                Model: {model.meshes.length} meshes, {model.animations.length} animations
                              </p>
                              <button
                                  onClick={() => setModel(null)}
                                  className="text-sm text-red-400 hover:text-red-300"
                              >
                                Remove model
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
              )}
            </div>

            {/* Center - 3D Viewer */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
                <h2 className="text-xl font-semibold mb-4">3D Model</h2>
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

            {/* Right - Pixel Preview */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
                <h2 className="text-xl font-semibold mb-4">Pixel Art Preview</h2>
                <div className="flex justify-center">
                  <PixelPreview
                      frame={processedFrames[0] || null}
                      scale={4}
                      showGrid={showGrid}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-center space-x-4">
            <button
                onClick={handleProcess}
                disabled={!model || isProcessing}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform transition hover:scale-105 disabled:hover:scale-100"
            >
              {isProcessing ? 'Processing...' : 'Generate Pixel Art'}
            </button>

            <button
                onClick={handleExport}
                disabled={processedFrames.length === 0 || isExporting}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform transition hover:scale-105 disabled:hover:scale-100 flex items-center"
            >
              <Download className="w-5 h-5 mr-2" />
              {isExporting ? 'Exporting...' : 'Download Spritesheet'}
            </button>
          </div>
        </main>
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