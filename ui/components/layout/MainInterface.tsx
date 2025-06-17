// ui/components/layout/MainInterface.tsx (Corrected)
import { RefObject } from 'react';
import { useAppEngine, ModelViewerRef } from '@ui/hooks/useAppEngine';
import { ModelViewer3D, PixelPreview, PresetSelector, SettingsPanel } from '@ui/components';
import { AnimationSelector } from '@ui/components/controls/AnimationSelector/AnimationSelector';
import {
  Download, Settings, Camera, Gamepad2, Palette, Sparkles
} from 'lucide-react';

type AppEngine = ReturnType<typeof useAppEngine>;

interface MainInterfaceProps extends AppEngine {
  modelViewerRef: RefObject<ModelViewerRef | null>;
}

export function MainInterface({ modelViewerRef, ...props }: MainInterfaceProps) {
  // Garde de nullité pour TypeScript
  if (!props.model) {
      return null;
  }

  const {
    camera, setCamera, cameraPresets, selectedPresetId,
    pixelSettings, setPixelSettings, exportSettings, setExportSettings,
    processedFrames, activeTab, setActiveTab, showGrid, isProcessing,
    currentAnimation, isAnimationPlaying, availableAnimations, isExporting,
    handleProcess, handleExport, handlePresetChange, handleAnimationSelect,
    handlePlayPause, handleAnimationReset,
  } = props;

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20">
            <div className="flex border-b border-white/20">
              <button onClick={() => setActiveTab('model')} className={`flex-1 px-6 py-4 font-medium transition-all duration-200 ${activeTab === 'model' ? 'text-purple-200 bg-purple-500/20 border-b-2 border-purple-400' : 'text-white/60 hover:text-white hover:bg-white/5'}`}><Camera className="w-4 h-4 inline mr-2" /> Camera</button>
              <button onClick={() => setActiveTab('settings')} className={`flex-1 px-6 py-4 font-medium transition-all duration-200 ${activeTab === 'settings' ? 'text-purple-200 bg-purple-500/20 border-b-2 border-purple-400' : 'text-white/60 hover:text-white hover:bg-white/5'}`}><Settings className="w-4 h-4 inline mr-2" /> Settings</button>
            </div>
            <div className="p-6">
              {activeTab === 'model' ? (
                <div className="space-y-6">
                  <div><h3 className="text-lg font-semibold text-white mb-4 flex items-center"><Gamepad2 className="w-5 h-5 mr-2 text-purple-400" /> Game Style Presets</h3><PresetSelector presets={cameraPresets} selectedPresetId={selectedPresetId} onPresetSelect={handlePresetChange} /></div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-sm text-purple-200 mb-2"><strong>Model Info:</strong> {props.model.meshes.length} meshes, {props.model.animations.length} animations</p>
                    <button onClick={() => props.setModel(null)} className="text-sm text-red-300 hover:text-red-200 transition-colors">← Load different model</button>
                  </div>
                  {props.model.animations.length > 0 && (
                    <div className="mt-6">
                      <AnimationSelector animations={availableAnimations} currentAnimation={currentAnimation} isPlaying={isAnimationPlaying} onAnimationSelect={handleAnimationSelect} onPlayPause={handlePlayPause} onReset={handleAnimationReset} />
                    </div>
                  )}
                </div>
              ) : (<SettingsPanel pixelSettings={pixelSettings} exportSettings={exportSettings} onPixelSettingsChange={setPixelSettings} onExportSettingsChange={setExportSettings} />)}
            </div>
          </div>
        </div>
        {/* Center Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center"><Camera className="w-5 h-5 mr-2 text-blue-400" /> 3D Model Preview</h2>
            <div className="rounded-xl overflow-hidden border border-white/20"><ModelViewer3D ref={modelViewerRef} model={props.model} camera={camera} width={400} height={400} showHelpers={showGrid} onCameraChange={setCamera} /></div>
            <div className="mt-4 text-center"><p className="text-xs text-purple-200">Drag to rotate • Scroll to zoom • Double-click to reset</p></div>
          </div>
        </div>
        {/* Right Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center"><Palette className="w-5 h-5 mr-2 text-pink-400" /> Pixel Art Result</h2>
            <div className="flex justify-center"><div className="rounded-xl overflow-hidden border border-white/20 bg-gray-900/50"><PixelPreview frame={processedFrames[0] || null} scale={4} showGrid={showGrid} /></div></div>
            <div className="mt-4 text-center">
              <div className="text-xs text-purple-200 space-y-1">
                <p>Resolution: {pixelSettings.targetSize.width} × {pixelSettings.targetSize.height}</p>
                <p>Algorithm: Professional Pixel Art (v2)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="mt-8 flex justify-center space-x-4">
        <button onClick={handleProcess} disabled={!props.model || isProcessing} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 disabled:text-gray-400 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl transform transition-all duration-200 hover:scale-105 disabled:hover:scale-100 flex items-center">{isProcessing ? (<><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div> Processing...</>) : (<><Sparkles className="w-5 h-5 mr-2" /> Generate Pixel Art</>)}</button>
        <button onClick={handleExport} disabled={processedFrames.length === 0 || isExporting} className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 disabled:text-gray-400 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl transform transition-all duration-200 hover:scale-105 disabled:hover:scale-100 flex items-center">{isExporting ? (<><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div> Exporting...</>) : (<><Download className="w-5 h-5 mr-2" /> Download Spritesheet</>)}</button>
      </div>
      {/* Processing Info */}
      {processedFrames.length > 0 && (<div className="mt-6 text-center"><div className="inline-flex items-center px-4 py-2 bg-green-500/20 border border-green-300/30 rounded-full text-green-200 text-sm">✅ Pixel art generated in {processedFrames[0].processingTime.toFixed(0)}ms</div></div>)}
    </>
  );
}
