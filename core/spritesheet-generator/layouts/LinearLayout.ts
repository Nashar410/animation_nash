// core/spritesheet-generator/layouts/LinearLayout.ts
import { ILayout, LayoutResult, FramePosition } from '@shared/interfaces';
import {ProcessedFrame} from "@shared/types/pixelart.ts";
import {Size} from "@shared/types/rendering.ts";

export type LinearDirection = 'horizontal' | 'vertical';

export interface LinearLayoutOptions {
    direction: LinearDirection;
    spacing: number;
    padding: number;
}

export class LinearLayout implements ILayout {
    constructor(private options: LinearLayoutOptions) {}

    calculate(frames: ProcessedFrame[], maxSize?: Size): LayoutResult {
        if (frames.length === 0) {
            return { positions: [], totalSize: { width: 0, height: 0 } };
        }

        const positions: FramePosition[] = [];
        let currentPosition = this.options.padding;
        let maxCrossSize = 0;

        for (const frame of frames) {
            const frameWidth = frame.processed.width;
            const frameHeight = frame.processed.height;

            if (this.options.direction === 'horizontal') {
                positions.push({
                    frameId: frame.id,
                    x: currentPosition,
                    y: this.options.padding,
                    width: frameWidth,
                    height: frameHeight,
                });
                currentPosition += frameWidth + this.options.spacing;
                maxCrossSize = Math.max(maxCrossSize, frameHeight);
            } else {
                positions.push({
                    frameId: frame.id,
                    x: this.options.padding,
                    y: currentPosition,
                    width: frameWidth,
                    height: frameHeight,
                });
                currentPosition += frameHeight + this.options.spacing;
                maxCrossSize = Math.max(maxCrossSize, frameWidth);
            }
        }

        // Calculate total size
        const totalSize = this.options.direction === 'horizontal'
            ? {
                width: currentPosition - this.options.spacing + this.options.padding,
                height: maxCrossSize + 2 * this.options.padding,
            }
            : {
                width: maxCrossSize + 2 * this.options.padding,
                height: currentPosition - this.options.spacing + this.options.padding,
            };

        return { positions, totalSize };
    }

    getTotalSize(frames: ProcessedFrame[]): Size {
        const result = this.calculate(frames);
        return result.totalSize;
    }

    canFit(frames: ProcessedFrame[], maxSize: Size): boolean {
        const totalSize = this.getTotalSize(frames);
        return totalSize.width <= maxSize.width && totalSize.height <= maxSize.height;
    }
}