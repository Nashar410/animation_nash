import { useState } from 'react';
import './App.css';

function App() {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            3D to Pixel Art Converter
          </h1>
          <p className="text-gray-400 mt-2">Transform your 3D models into retro pixel art sprites</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Upload 3D Model</h2>
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-purple-500 transition-colors">
              <input
                type="file"
                accept=".glb,.gltf"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="text-gray-400 space-y-2">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p>Click to upload or drag and drop</p>
                  <p className="text-sm">GLB, GLTF files supported</p>
                </div>
              </label>
              {file && (
                <p className="mt-4 text-green-400">
                  Selected: {file.name}
                </p>
              )}
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Preview</h2>
            <div className="bg-gray-900 rounded-lg h-64 flex items-center justify-center">
              <p className="text-gray-500">Model preview will appear here</p>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6 shadow-xl">
          <h2 className="text-xl font-semibold mb-4">Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Preset</label>
              <select className="w-full bg-gray-700 rounded px-3 py-2">
                <option>Pokémon Style</option>
                <option>Final Fantasy Style</option>
                <option>Chrono Trigger Style</option>
                <option>Zelda Style</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Pixel Size</label>
              <input type="range" min="16" max="128" className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Color Palette</label>
              <select className="w-full bg-gray-700 rounded px-3 py-2">
                <option>Full Color</option>
                <option>Game Boy</option>
                <option>NES</option>
                <option>PICO-8</option>
              </select>
            </div>
          </div>
        </div>

        {/* Export Section */}
        <div className="mt-8 flex justify-center">
          <button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform transition hover:scale-105">
            Generate Spritesheet
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
