// ui/components/controls/PresetSelector/PresetSelector.tsx - Version améliorée
import { CameraPreset } from '@shared/types';
import { Gamepad2, Sword, Zap, Shield } from 'lucide-react';
import React from "react";

interface PresetSelectorProps {
    presets: CameraPreset[];
    selectedPresetId: string | null;
    onPresetSelect: (presetId: string) => void;
}

const presetIcons: Record<string, React.ComponentType<{ className: string }>> = {
    'pokemon': Gamepad2,
    'final-fantasy': Sword,
    'chrono-trigger': Zap,
    'zelda-alttp': Shield,
};

const presetColors: Record<string, string> = {
    'pokemon': 'from-yellow-400 to-red-500',
    'final-fantasy': 'from-blue-400 to-purple-600',
    'chrono-trigger': 'from-green-400 to-blue-500',
    'zelda-alttp': 'from-emerald-400 to-teal-500',
};

export function PresetSelector({
                                   presets,
                                   selectedPresetId,
                                   onPresetSelect,
                               }: PresetSelectorProps) {
    return (
        <div className="grid grid-cols-2 gap-3">
            {presets.map((preset) => {
                const Icon = presetIcons[preset.id] || Gamepad2;
                const isSelected = selectedPresetId === preset.id;
                const colorClass = presetColors[preset.id] || 'from-purple-400 to-pink-500';

                return (
                    <button
                        key={preset.id}
                        onClick={() => onPresetSelect(preset.id)}
                        className={`relative p-4 rounded-xl border-2 transition-all duration-300 group ${
                            isSelected
                                ? 'border-purple-400 bg-purple-500/20 shadow-lg shadow-purple-500/20 scale-105'
                                : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10 hover:scale-102'
                        }`}
                    >
                        {/* Background gradient */}
                        <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${colorClass} opacity-10 ${
                            isSelected ? 'opacity-20' : 'group-hover:opacity-15'
                        } transition-opacity duration-300`} />

                        {/* Content */}
                        <div className="relative z-10">
                            {/* Icon */}
                            <div className={`w-8 h-8 mb-3 mx-auto rounded-lg bg-gradient-to-br ${colorClass} p-1.5 ${
                                isSelected ? 'shadow-lg' : ''
                            }`}>
                                <Icon className="w-full h-full text-white" />
                            </div>

                            {/* Title */}
                            <h3 className={`font-semibold text-sm mb-1 transition-colors ${
                                isSelected ? 'text-white' : 'text-white/80 group-hover:text-white'
                            }`}>
                                {preset.name}
                            </h3>

                            {/* Description */}
                            <p className={`text-xs leading-tight transition-colors ${
                                isSelected ? 'text-purple-200' : 'text-white/60 group-hover:text-white/70'
                            }`}>
                                {preset.description}
                            </p>

                            {/* Camera info */}
                            <div className="mt-3 flex justify-center">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                    isSelected
                                        ? 'bg-purple-400/30 text-purple-200'
                                        : 'bg-white/10 text-white/50'
                                }`}>
                                    {preset.camera.type === 'orthographic' ? 'Ortho' : 'Perspective'}
                                </span>
                            </div>
                        </div>

                        {/* Selection indicator */}
                        {isSelected && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-400 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full" />
                            </div>
                        )}

                        {/* Hover glow effect */}
                        <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${colorClass} opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none`} />
                    </button>
                );
            })}
        </div>
    );
}