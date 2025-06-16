
// shared/interfaces/ILayout.ts

import {ProcessedFrame} from "@shared/types/pixelart.ts";
import {Size} from "@shared/types/rendering.ts";

export interface ILayout {
    /**
     * Calcule la disposition des frames
     */
    calculate(frames: ProcessedFrame[], containerSize?: Size): LayoutResult;

    /**
     * Retourne la taille totale nécessaire
     */
    getTotalSize(frames: ProcessedFrame[]): Size;

    /**
     * Valide si le layout peut accommoder les frames
     */
    canFit(frames: ProcessedFrame[], maxSize: Size): boolean;
}


export interface LayoutResult {
    positions: FramePosition[];
    totalSize: Size;
}

export interface FramePosition {
    frameId: string;
    x: number;
    y: number;
    width: number;
    height: number;
}
