// shared/utils/color.ts
import { Color } from '../types/rendering';
import { ColorPalette } from '../types/pixelart';

export function rgbToHex(color: Color): string {
    const r = Math.round(color.r).toString(16).padStart(2, '0');
    const g = Math.round(color.g).toString(16).padStart(2, '0');
    const b = Math.round(color.b).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
}

export function hexToRgb(hex: string): Color {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: 255,
    } : { r: 0, g: 0, b: 0, a: 255 };
}

export function colorDistance(a: Color, b: Color): number {
    const dr = a.r - b.r;
    const dg = a.g - b.g;
    const db = a.b - b.b;
    // Utiliser la formule CIE76 pour une meilleure perception des couleurs
    return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * Trouve la couleur la plus proche dans une palette donnée.
 * @param color La couleur à comparer.
 * @param palette La palette de couleurs.
 * @returns La couleur la plus proche de la palette.
 */
export function findClosestColor(color: Color, palette: ColorPalette): Color {
    let closestColor = palette.colors[0];
    let minDistance = Number.POSITIVE_INFINITY;

    for (const paletteColor of palette.colors) {
        const distance = colorDistance(color, paletteColor);
        if (distance < minDistance) {
            minDistance = distance;
            closestColor = paletteColor;
        }
    }

    return closestColor;
}
