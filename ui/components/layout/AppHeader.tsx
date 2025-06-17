// ui/components/layout/AppHeader.tsx
import { Gamepad2, Sparkles, Grid3x3, Github } from 'lucide-react';

interface AppHeaderProps {
  showGrid: boolean;
  onShowGridToggle: () => void;
  hasModel: boolean;
}

export function AppHeader({ showGrid, onShowGridToggle, hasModel }: AppHeaderProps) {
  return (
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
              onClick={onShowGridToggle}
              className={`p-3 rounded-xl transition-all duration-200 ${
                showGrid
                  ? 'bg-purple-500/20 text-purple-200 shadow-lg'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
              title={`${showGrid ? 'Hide' : 'Show'} grid helpers`}
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
            {!hasModel && (
              <div className="text-xs text-white/60">
                Grid: {showGrid ? 'ON' : 'OFF'}
              </div>
            )}
            <a
              href="https://github.com" // TODO: Mettre le lien de votre repo
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-white/10 text-white/80 hover:bg-white/20 transition-all duration-200"
              title="View on GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
