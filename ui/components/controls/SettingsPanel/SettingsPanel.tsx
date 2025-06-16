// ui/components/controls/SettingsPanel/SettingsPanel.tsx - Version avec palettes
import { PixelSettings, ExportSettings } from '@shared/types';
import { Slider } from '../Slider/Slider';
import { PalettePresets } from '@core/pixel-processor/palettes/PalettePresets';

interface SettingsPanelProps {
    pixelSettings: PixelSettings;
    exportSettings: ExportSettings;
    onPixelSettingsChange: (settings: Partial<PixelSettings>) => void;
    onExportSettingsChange: (settings: Partial<ExportSettings>) => void;
}

export function SettingsPanel({
                                  pixelSettings,
                                  exportSettings,
                                  onPixelSettingsChange,
                                  onExportSettingsChange,
                              }: SettingsPanelProps) {
    return (
        <div className="space-y-6">
            {/* Pixel Settings */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Pixel Art Settings</h3>

                <div className="space-y-4">
                    {/* Target Size */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Target Size: {pixelSettings.targetSize.width} × {pixelSettings.targetSize.height}
                        </label>
                        <Slider
                            min={8}
                            max={128}
                            value={pixelSettings.targetSize.width}
                            onChange={(value) =>
                                onPixelSettingsChange({
                                    targetSize: { width: value, height: value },
                                })
                            }
                        />
                    </div>

                    {/* Pixel Scale */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Pixel Scale: {pixelSettings.pixelScale}x
                        </label>
                        <Slider
                            min={1}
                            max={8}
                            value={pixelSettings.pixelScale}
                            onChange={(value) =>
                                onPixelSettingsChange({ pixelScale: value })
                            }
                        />
                    </div>

                    {/* Color Palette */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Color Palette
                        </label>
                        <select
                            value={pixelSettings.colorPalette?.id || 'none'}
                            onChange={(e) => {
                                const paletteId = e.target.value;
                                const palette = paletteId === 'none'
                                    ? undefined
                                    : PalettePresets.getById(paletteId);
                                onPixelSettingsChange({ colorPalette: palette });
                            }}
                            className="w-full bg-gray-700 rounded px-3 py-2 text-white"
                        >
                            <option value="none">Full Color</option>
                            {PalettePresets.all.map(palette => (
                                <option key={palette.id} value={palette.id}>
                                    {palette.name} ({palette.maxColors} colors)
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Dithering */}
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="dithering"
                            checked={pixelSettings.dithering}
                            onChange={(e) =>
                                onPixelSettingsChange({ dithering: e.target.checked })
                            }
                            className="rounded"
                        />
                        <label htmlFor="dithering" className="text-sm">
                            Enable Dithering
                        </label>
                    </div>

                    {/* Dithering Strength */}
                    {pixelSettings.dithering && (
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Dithering Strength: {(pixelSettings.ditheringStrength * 100).toFixed(0)}%
                            </label>
                            <Slider
                                min={0}
                                max={1}
                                step={0.1}
                                value={pixelSettings.ditheringStrength}
                                onChange={(value) =>
                                    onPixelSettingsChange({ ditheringStrength: value })
                                }
                            />
                        </div>
                    )}

                    {/* Contrast Boost */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Contrast Boost: {(pixelSettings.contrastBoost * 100).toFixed(0)}%
                        </label>
                        <Slider
                            min={0}
                            max={1}
                            step={0.1}
                            value={pixelSettings.contrastBoost}
                            onChange={(value) =>
                                onPixelSettingsChange({ contrastBoost: value })
                            }
                        />
                    </div>

                    {/* Brightness Adjust */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Brightness: {pixelSettings.brightnessAdjust > 0 ? '+' : ''}{pixelSettings.brightnessAdjust}
                        </label>
                        <Slider
                            min={-100}
                            max={100}
                            value={pixelSettings.brightnessAdjust}
                            onChange={(value) =>
                                onPixelSettingsChange({ brightnessAdjust: value })
                            }
                        />
                    </div>
                </div>
            </div>

            {/* Export Settings */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Export Settings</h3>

                <div className="space-y-4">
                    {/* Format */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Format</label>
                        <select
                            value={exportSettings.format}
                            onChange={(e) =>
                                onExportSettingsChange({
                                    format: e.target.value as ExportSettings['format'],
                                })
                            }
                            className="w-full bg-gray-700 rounded px-3 py-2 text-white"
                        >
                            <option value="png">PNG</option>
                            <option value="webp">WebP</option>
                            <option value="json">JSON (Metadata only)</option>
                        </select>
                    </div>

                    {/* Layout */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Layout</label>
                        <select
                            value={exportSettings.layout.type}
                            onChange={(e) =>
                                onExportSettingsChange({
                                    layout: {
                                        ...exportSettings.layout,
                                        type: e.target.value as 'grid' | 'linear' | 'packed',
                                    },
                                })
                            }
                            className="w-full bg-gray-700 rounded px-3 py-2 text-white"
                        >
                            <option value="grid">Grid</option>
                            <option value="linear">Linear</option>
                            <option value="packed">Packed</option>
                        </select>
                    </div>

                    {/* Scale */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Export Scale: {exportSettings.scale}x
                        </label>
                        <Slider
                            min={1}
                            max={8}
                            value={exportSettings.scale}
                            onChange={(value) =>
                                onExportSettingsChange({ scale: value })
                            }
                        />
                    </div>

                    {/* Transparent Background */}
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="transparent"
                            checked={exportSettings.transparent}
                            onChange={(e) =>
                                onExportSettingsChange({ transparent: e.target.checked })
                            }
                            className="rounded"
                        />
                        <label htmlFor="transparent" className="text-sm">
                            Transparent Background
                        </label>
                    </div>

                    {/* Include Metadata */}
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="metadata"
                            checked={exportSettings.includeMetadata}
                            onChange={(e) =>
                                onExportSettingsChange({ includeMetadata: e.target.checked })
                            }
                            className="rounded"
                        />
                        <label htmlFor="metadata" className="text-sm">
                            Include Metadata
                        </label>
                    </div>
                </div>
            </div>

            {/* Quick Presets */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Quick Presets</h3>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => onPixelSettingsChange({
                            targetSize: { width: 16, height: 16 },
                            pixelScale: 8,
                            colorPalette: PalettePresets.gameboy,
                            dithering: false
                        })}
                        className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
                    >
                        Game Boy
                    </button>
                    <button
                        onClick={() => onPixelSettingsChange({
                            targetSize: { width: 32, height: 32 },
                            pixelScale: 4,
                            colorPalette: PalettePresets.pico8,
                            dithering: true,
                            ditheringStrength: 0.3
                        })}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                    >
                        PICO-8
                    </button>
                    <button
                        onClick={() => onPixelSettingsChange({
                            targetSize: { width: 64, height: 64 },
                            pixelScale: 2,
                            colorPalette: PalettePresets.nes,
                            dithering: false
                        })}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
                    >
                        NES
                    </button>
                    <button
                        onClick={() => onPixelSettingsChange({
                            targetSize: { width: 128, height: 128 },
                            pixelScale: 1,
                            colorPalette: undefined,
                            dithering: false
                        })}
                        className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm transition-colors"
                    >
                        Modern
                    </button>
                </div>
            </div>
        </div>
    );
}