// ui/components/controls/AnimationSelector/AnimationSelector.tsx
import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Film } from 'lucide-react';

interface AnimationSelectorProps {
    animations: string[];
    currentAnimation: string | null;
    isPlaying: boolean;
    onAnimationSelect: (animationName: string) => void;
    onPlayPause: () => void;
    onReset: () => void;
}

export function AnimationSelector({
                                      animations,
                                      currentAnimation,
                                      isPlaying,
                                      onAnimationSelect,
                                      onPlayPause,
                                      onReset
                                  }: AnimationSelectorProps) {
    const [selectedAnimation, setSelectedAnimation] = useState<string | null>(currentAnimation);

    useEffect(() => {
        if (animations.length > 0 && !selectedAnimation) {
            // Auto-sélectionner la première animation
            const firstAnimation = animations[0];
            setSelectedAnimation(firstAnimation);
            onAnimationSelect(firstAnimation);
        }
    }, [animations]);

    const handleAnimationChange = (animationName: string) => {
        setSelectedAnimation(animationName);
        onAnimationSelect(animationName);
    };

    if (animations.length === 0) {
        return (
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-sm text-white/60 text-center flex items-center justify-center">
                    <Film className="w-4 h-4 mr-2" />
                    No animations available
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
                <Film className="w-5 h-5 mr-2 text-purple-400" />
                Animations ({animations.length})
            </h3>

            {/* Animation List */}
            <div className="space-y-2">
                {animations.map((animName, index) => (
                    <button
                        key={animName}
                        onClick={() => handleAnimationChange(animName)}
                        className={`w-full px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                            selectedAnimation === animName
                                ? 'bg-purple-500/20 text-purple-200 border border-purple-400/50'
                                : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="font-medium">
                                {animName || `Animation ${index + 1}`}
                            </span>
                            {selectedAnimation === animName && isPlaying && (
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse animation-delay-2000"></div>
                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse animation-delay-4000"></div>
                                </div>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-center space-x-2 pt-4 border-t border-white/10">
                <button
                    onClick={onReset}
                    className="p-3 rounded-xl bg-white/10 text-white/80 hover:bg-white/20 transition-all duration-200"
                    title="Reset animation"
                >
                    <RotateCcw className="w-5 h-5" />
                </button>

                <button
                    onClick={onPlayPause}
                    disabled={!selectedAnimation}
                    className={`p-4 rounded-xl transition-all duration-200 ${
                        isPlaying
                            ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                            : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                    } disabled:bg-gray-500/20 disabled:text-gray-400`}
                    title={isPlaying ? 'Pause' : 'Play'}
                >
                    {isPlaying ? (
                        <Pause className="w-6 h-6" />
                    ) : (
                        <Play className="w-6 h-6" />
                    )}
                </button>
            </div>

            {/* Animation Info */}
            {selectedAnimation && (
                <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-400/30">
                    <p className="text-xs text-purple-200">
                        <span className="font-semibold">Current:</span> {selectedAnimation}
                    </p>
                    <p className="text-xs text-purple-200 mt-1">
                        <span className="font-semibold">Status:</span> {isPlaying ? 'Playing' : 'Paused'}
                    </p>
                </div>
            )}
        </div>
    );
}