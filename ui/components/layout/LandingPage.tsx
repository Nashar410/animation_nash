// ui/components/layout/LandingPage.tsx
import { Zap, Camera, Palette, Download, Upload, Heart } from 'lucide-react';
import { FileUpload } from '@ui/components';

interface LandingPageProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  error: Error | null;
}

export function LandingPage({ onFileSelect, isLoading, error }: LandingPageProps) {
  return (
    <div className="max-w-4xl mx-auto text-center space-y-12">
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
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300"><Camera className="w-12 h-12 text-purple-400 mb-4 mx-auto" /><h3 className="text-lg font-semibold text-white mb-2">Smart Auto-Framing</h3><p className="text-purple-100 text-sm">Intelligent model centering and optimal camera positioning</p></div>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300"><Palette className="w-12 h-12 text-pink-400 mb-4 mx-auto" /><h3 className="text-lg font-semibold text-white mb-2">Pro Algorithms</h3><p className="text-purple-100 text-sm">Advanced noise reduction and edge-preserving techniques</p></div>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300"><Download className="w-12 h-12 text-blue-400 mb-4 mx-auto" /><h3 className="text-lg font-semibold text-white mb-2">Clean Output</h3><p className="text-purple-100 text-sm">Artifact-free pixel art ready for your game engine</p></div>
      </div>
      <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl max-w-2xl mx-auto">
        <div className="mb-6"><Upload className="w-16 h-16 text-purple-400 mx-auto mb-4" /><h3 className="text-2xl font-bold text-white mb-2">Upload Your 3D Model</h3><p className="text-purple-200">Supports GLB and GLTF formats up to 50MB</p></div>
        <FileUpload accept=".glb,.gltf" onFileSelect={onFileSelect} maxSize={50} />
        {isLoading && (<div className="mt-4 flex items-center justify-center text-purple-200"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400 mr-3"></div>Loading your model...</div>)}
        {error && (<div className="mt-4 p-4 bg-red-500/20 border border-red-300/30 rounded-xl text-red-200">Error: {error.message}</div>)}
      </div>
      <div className="text-center text-purple-300 text-sm"><p className="flex items-center justify-center">Made with <Heart className="w-4 h-4 mx-1 text-pink-400" /> for indie game developers</p></div>
    </div>
  );
}
