// core/spritesheet-generator/layouts/GridLayout.ts
import { ILayout, LayoutResult, FramePosition } from '@shared/interfaces';
import {ProcessedFrame} from "@shared/types/pixelart.ts";
import {Size} from "@shared/types/rendering.ts";

export interface GridLayoutOptions {
    columns?: number;
    rows?: number;
    spacing: number;
    padding: number;
}

export class GridLayout implements ILayout {
    constructor(private options: GridLayoutOptions) {}

    calculate(frames: ProcessedFrame[], maxSize?: Size): LayoutResult {
        if (frames.length === 0) {
            return { positions: [], totalSize: { width: 0, height: 0 } };
        }

        // Determine frame size (assume all frames are same size)
        const frameWidth = frames[0].processed.width;
        const frameHeight = frames[0].processed.height;

        // Calculate grid dimensions
        let { columns, rows } = this.calculateGridDimensions(
            frames.length,
            frameWidth,
            frameHeight,
            maxSize
        );

        // Calculate total size
        const totalWidth =
            columns * frameWidth +
            (columns - 1) * this.options.spacing +
            2 * this.options.padding;

        const totalHeight =
            rows * frameHeight +
            (rows - 1) * this.options.spacing +
            2 * this.options.padding;

        // Calculate positions
        const positions: FramePosition[] = [];
        for (let i = 0; i < frames.length; i++) {
            const col = i % columns;
            const row = Math.floor(i / columns);

            positions.push({
                frameId: frames[i].id,
                x: this.options.padding + col * (frameWidth + this.options.spacing),
                y: this.options.padding + row * (frameHeight + this.options.spacing),
                width: frameWidth,
                height: frameHeight,
            });
        }

        return {
            positions,
            totalSize: { width: totalWidth, height: totalHeight },
        };
    }

    getTotalSize(frames: ProcessedFrame[]): Size {
        const result = this.calculate(frames);
        return result.totalSize;
    }

    canFit(frames: ProcessedFrame[], maxSize: Size): boolean {
        const totalSize = this.getTotalSize(frames);
        return totalSize.width <= maxSize.width && totalSize.height <= maxSize.height;
    }

    private calculateGridDimensions(
        frameCount: number,
        frameWidth: number,
        _frameHeight: number, // Prefixé avec _
        maxSize?: Size
    ): { columns: number; rows: number } {
        // Use provided dimensions if available
        if (this.options.columns && this.options.rows) {
            return {
                columns: this.options.columns,
                rows: this.options.rows
            };
        }

        // Calculate based on one dimension if provided
        if (this.options.columns) {
            const rows = Math.ceil(frameCount / this.options.columns);
            return { columns: this.options.columns, rows };
        }

        if (this.options.rows) {
            const columns = Math.ceil(frameCount / this.options.rows);
            return { columns, rows: this.options.rows };
        }

        // Auto-calculate optimal grid
        let columns = Math.ceil(Math.sqrt(frameCount));
        let rows = Math.ceil(frameCount / columns);

        // Adjust for max size constraints if provided
        if (maxSize) {
            const maxColumns = Math.floor(
                (maxSize.width - 2 * this.options.padding + this.options.spacing) /
                (frameWidth + this.options.spacing)
            );

            if (columns > maxColumns) {
                columns = maxColumns;
                rows = Math.ceil(frameCount / columns);
            }
        }

        return { columns, rows };
    }
}