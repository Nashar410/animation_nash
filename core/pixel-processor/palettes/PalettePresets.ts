// core/pixel-processor/palettes/PalettePresets.ts
import { ColorPalette } from '@shared/types/pixelart';

export class PalettePresets {
    static readonly gameboy: ColorPalette = {
        id: 'gameboy',
        name: 'Game Boy',
        maxColors: 4,
        colors: [
            { r: 15, g: 56, b: 15, a: 255 },    // Vert foncé
            { r: 48, g: 98, b: 48, a: 255 },   // Vert moyen foncé
            { r: 139, g: 172, b: 15, a: 255 }, // Vert moyen clair
            { r: 155, g: 188, b: 15, a: 255 }  // Vert clair
        ]
    };

    static readonly pico8: ColorPalette = {
        id: 'pico8',
        name: 'PICO-8',
        maxColors: 16,
        colors: [
            { r: 0, g: 0, b: 0, a: 255 },       // Noir
            { r: 29, g: 43, b: 83, a: 255 },    // Bleu foncé
            { r: 126, g: 37, b: 83, a: 255 },   // Violet foncé
            { r: 0, g: 135, b: 81, a: 255 },    // Vert foncé
            { r: 171, g: 82, b: 54, a: 255 },   // Marron
            { r: 95, g: 87, b: 79, a: 255 },    // Gris foncé
            { r: 194, g: 195, b: 199, a: 255 }, // Gris clair
            { r: 255, g: 241, b: 232, a: 255 }, // Blanc cassé
            { r: 255, g: 0, b: 77, a: 255 },    // Rouge
            { r: 255, g: 163, b: 0, a: 255 },   // Orange
            { r: 255, g: 236, b: 39, a: 255 },  // Jaune
            { r: 0, g: 228, b: 54, a: 255 },    // Vert
            { r: 41, g: 173, b: 255, a: 255 },  // Bleu
            { r: 131, g: 118, b: 156, a: 255 }, // Indigo
            { r: 255, g: 119, b: 168, a: 255 }, // Rose
            { r: 255, g: 204, b: 170, a: 255 }  // Pêche
        ]
    };

    static readonly nes: ColorPalette = {
        id: 'nes',
        name: 'NES',
        maxColors: 64,
        colors: [
            { r: 84, g: 84, b: 84, a: 255 },
            { r: 0, g: 30, b: 116, a: 255 },
            { r: 8, g: 16, b: 144, a: 255 },
            { r: 48, g: 0, b: 136, a: 255 },
            { r: 68, g: 0, b: 100, a: 255 },
            { r: 92, g: 0, b: 48, a: 255 },
            { r: 84, g: 4, b: 0, a: 255 },
            { r: 60, g: 24, b: 0, a: 255 },
            { r: 32, g: 42, b: 0, a: 255 },
            { r: 8, g: 58, b: 0, a: 255 },
            { r: 0, g: 64, b: 0, a: 255 },
            { r: 0, g: 60, b: 0, a: 255 },
            { r: 0, g: 50, b: 60, a: 255 },
            { r: 0, g: 0, b: 0, a: 255 },
            { r: 0, g: 0, b: 0, a: 255 },
            { r: 0, g: 0, b: 0, a: 255 },
            // ... (simplifié, la palette NES complète a 64 couleurs)
        ]
    };

    static readonly c64: ColorPalette = {
        id: 'c64',
        name: 'Commodore 64',
        maxColors: 16,
        colors: [
            { r: 0, g: 0, b: 0, a: 255 },       // Noir
            { r: 255, g: 255, b: 255, a: 255 }, // Blanc
            { r: 136, g: 57, b: 50, a: 255 },   // Rouge
            { r: 103, g: 182, b: 189, a: 255 }, // Cyan
            { r: 139, g: 63, b: 150, a: 255 },  // Violet
            { r: 85, g: 160, b: 73, a: 255 },   // Vert
            { r: 64, g: 49, b: 141, a: 255 },   // Bleu
            { r: 191, g: 206, b: 114, a: 255 }, // Jaune
            { r: 139, g: 84, b: 41, a: 255 },   // Orange
            { r: 87, g: 66, b: 0, a: 255 },     // Marron
            { r: 184, g: 105, b: 98, a: 255 },  // Rouge clair
            { r: 80, g: 80, b: 80, a: 255 },    // Gris foncé
            { r: 120, g: 120, b: 120, a: 255 }, // Gris moyen
            { r: 148, g: 224, b: 137, a: 255 }, // Vert clair
            { r: 120, g: 105, b: 196, a: 255 }, // Bleu clair
            { r: 159, g: 159, b: 159, a: 255 }  // Gris clair
        ]
    };

    static readonly monochrome: ColorPalette = {
        id: 'monochrome',
        name: 'Monochrome',
        maxColors: 2,
        colors: [
            { r: 0, g: 0, b: 0, a: 255 },     // Noir
            { r: 255, g: 255, b: 255, a: 255 } // Blanc
        ]
    };

    static readonly all: ColorPalette[] = [
        PalettePresets.pico8,
        PalettePresets.gameboy,
        PalettePresets.nes,
        PalettePresets.c64,
        PalettePresets.monochrome
    ];

    static getById(id: string): ColorPalette | undefined {
        return PalettePresets.all.find(palette => palette.id === id);
    }

    static getByName(name: string): ColorPalette | undefined {
        return PalettePresets.all.find(palette => palette.name === name);
    }
}