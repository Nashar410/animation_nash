// shared/types/pixelart.ts
import {Color, Size} from "@shared/types/rendering.ts";

export interface ColorPalette {
    id: string;
    name: string;
    colors: Color[];
    maxColors: number;
}

export interface PixelSettings {
    targetSize: Size;
    pixelScale: number;
    colorPalette?: ColorPalette;
    dithering: boolean;
    ditheringStrength: number;
    contrastBoost: number;
    brightnessAdjust: number;
}

export interface ProcessedFrame {
    id: string;
    original: ImageData;
    processed: ImageData;
    frameNumber: number;
    animationName?: string;
    processingTime: number;
}

export type PixelAlgorithm =
    | 'nearest-neighbor'
    | 'bilinear'
    | 'bicubic'
    | 'lanczos';