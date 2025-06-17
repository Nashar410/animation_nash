// src/App.tsx (Refactored)
import { useRef } from 'react';
import { AppProvider } from '@ui/contexts/AppContext';
import { useAppEngine, ModelViewerRef } from '@ui/hooks/useAppEngine';
import { AppHeader } from '@ui/components/layout/AppHeader';
import { LandingPage } from '@ui/components/layout/LandingPage';
import { MainInterface } from '@ui/components/layout/MainInterface';

function AppContent() {
  // Une référence pour pouvoir appeler les méthodes du ModelViewer depuis le hook
  const modelViewerRef = useRef<ModelViewerRef | null>(null);

  // Le hook centralise toute la logique et l'état
  const engine = useAppEngine(modelViewerRef);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900">
      {/* Fond animé */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        <AppHeader
          showGrid={engine.showGrid}
          onShowGridToggle={() => engine.setShowGrid(!engine.showGrid)}
          hasModel={!!engine.model}
        />

        <main className="container mx-auto px-4 py-8">
          {!engine.model ? (
            <LandingPage
              onFileSelect={engine.handleFileSelect}
              isLoading={engine.modelLoading}
              error={engine.modelError}
            />
          ) : (
            <MainInterface
              modelViewerRef={modelViewerRef}
              {...engine}
            />
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
