// ui/components/controls/PresetSelector/PresetSelector.tsx
import { CameraPreset } from '@shared/types';

interface PresetSelectorProps {
    presets: CameraPreset[];
    selectedPresetId: string | null;
    onPresetSelect: (presetId: string) => void;
}

export function PresetSelector({
                                   presets,
                                   selectedPresetId,
                                   onPresetSelect,
                               }: PresetSelectorProps) {
    return (
        <div className="grid grid-cols-2 gap-4">
            {presets.map((preset) => (
                <button
                    key={preset.id}
                    onClick={() => onPresetSelect(preset.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                        selectedPresetId === preset.id
                            ? 'border-purple-500 bg-purple-500 bg-opacity-10'
                            : 'border-gray-700 hover:border-gray-600'
                    }`}
                >
                    <h3 className="font-semibold mb-1">{preset.name}</h3>
                    <p className="text-sm text-gray-400">{preset.description}</p>
                </button>
            ))}
        </div>
    );
}