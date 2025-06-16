// shared/types/export.ts - Version corrigée
import { Size } from './rendering'; // Import manquant ajouté

export interface Layout {
    type: 'grid' | 'linear' | 'packed';
    columns?: number;
    rows?: number;
    spacing: number;
    padding: number;
}

export interface ExportSettings {
    format: ExportFormat;
    layout: Layout;
    scale: number;
    includeMetadata: boolean;
    transparent: boolean;
    compression?: number;
}

export type ExportFormat = 'png' | 'webp' | 'gif' | 'json';

export interface ExportResult {
    blob: Blob;
    format: ExportFormat;
    size: Size;
    fileSize: number;
    metadata?: ExportMetadata;
}

export interface ExportMetadata {
    frames: FrameMetadata[];
    animations: AnimationMetadata[];
    settings: ExportSettings;
    created: Date;
}

export interface FrameMetadata {
    index: number;
    x: number;
    y: number;
    width: number;
    height: number;
    duration?: number;
}

export interface AnimationMetadata {
    name: string;
    startFrame: number;
    endFrame: number;
    loop: boolean;
    fps: number;
}