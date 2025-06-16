// core/camera-system/presets/PresetFactory.ts
import { IPreset } from '@shared/interfaces';
import { PokemonPreset } from './PokemonPreset';
import { FFPreset } from './FFPreset';
import { ChronoTriggerPreset } from './ChronoTriggerPreset';
import { ZeldaPreset } from './ZeldaPreset';

export class PresetFactory {
    private static presets: Map<string, new () => IPreset> = new Map([
        ['pokemon', PokemonPreset],
        ['final-fantasy', FFPreset],
        ['chrono-trigger', ChronoTriggerPreset],
        ['zelda-alttp', ZeldaPreset],
    ]);

    static create(name: string): IPreset {
        const PresetClass = this.presets.get(name);
        if (!PresetClass) {
            throw new Error(`Unknown preset: ${name}`);
        }
        return new PresetClass();
    }

    static register(name: string, PresetClass: new () => IPreset): void {
        this.presets.set(name, PresetClass);
    }

    static getAvailablePresets(): string[] {
        return Array.from(this.presets.keys());
    }

    static createAll(): Map<string, IPreset> {
        const instances = new Map<string, IPreset>();
        for (const [name, PresetClass] of this.presets) {
            instances.set(name, new PresetClass());
        }
        return instances;
    }
}