// ui/components/controls/SettingsPanel/SettingsPanel.tsx
import { PixelSettings, ExportSettings } from '@shared/types';
import { Slider } from '../Slider/Slider';

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
                </div>
            </div>

            {/* Export Settings */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Export Settings</h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Format</label>
                        <select
                            value={exportSettings.format}
                            onChange={(e) =>
                                onExportSettingsChange({
                                    format: e.target.value as ExportSettings['format'],
                                })
                            }
                            className="w-full bg-gray-700 rounded px-3 py-2"
                        >
                            <option value="png">PNG</option>
                            <option value="webp">WebP</option>
                            <option value="json">JSON (Metadata only)</option>
                        </select>
                    </div>

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
                            className="w-full bg-gray-700 rounded px-3 py-2"
                        >
                            <option value="grid">Grid</option>
                            <option value="linear">Linear</option>
                            <option value="packed">Packed</option>
                        </select>
                    </div>

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
                </div>
            </div>
        </div>
    );
}