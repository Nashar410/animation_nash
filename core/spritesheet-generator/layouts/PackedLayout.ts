// core/spritesheet-generator/layouts/PackedLayout.ts
import { ILayout, LayoutResult, FramePosition } from '@shared/interfaces';
import {ProcessedFrame} from "@shared/types/pixelart.ts";
import {Size} from "@shared/types/rendering.ts";

export interface PackedLayoutOptions {
    spacing: number;
    padding: number;
    sortBy?: 'area' | 'height' | 'width' | 'none';
}

interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export class PackedLayout implements ILayout {
    constructor(private options: PackedLayoutOptions) {}

    calculate(frames: ProcessedFrame[], maxSize?: Size): LayoutResult {
        if (frames.length === 0) {
            return { positions: [], totalSize: { width: 0, height: 0 } };
        }

        // Sort frames if requested
        const sortedFrames = this.sortFrames(frames);

        // Pack frames using a simple bin packing algorithm
        const positions: FramePosition[] = [];
        const freeRects: Rect[] = [];

        // Start with the entire canvas as a free rectangle
        const initialSize = this.estimateInitialSize(sortedFrames, maxSize);
        freeRects.push({
            x: this.options.padding,
            y: this.options.padding,
            width: initialSize.width - 2 * this.options.padding,
            height: initialSize.height - 2 * this.options.padding,
        });

        let maxX = 0;
        let maxY = 0;

        for (const frame of sortedFrames) {
            const frameWidth = frame.processed.width + this.options.spacing;
            const frameHeight = frame.processed.height + this.options.spacing;

            // Find the best free rectangle to place this frame
            const bestRect = this.findBestRect(freeRects, frameWidth, frameHeight);

            if (bestRect) {
                // Place the frame
                positions.push({
                    frameId: frame.id,
                    x: bestRect.rect.x,
                    y: bestRect.rect.y,
                    width: frame.processed.width,
                    height: frame.processed.height,
                });

                maxX = Math.max(maxX, bestRect.rect.x + frame.processed.width);
                maxY = Math.max(maxY, bestRect.rect.y + frame.processed.height);

                // Split the used rectangle
                this.splitRect(freeRects, bestRect.index, frameWidth, frameHeight);
            }
        }

        return {
            positions,
            totalSize: {
                width: maxX + this.options.padding,
                height: maxY + this.options.padding,
            },
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

    private sortFrames(frames: ProcessedFrame[]): ProcessedFrame[] {
        const sorted = [...frames];

        switch (this.options.sortBy) {
            case 'area':
                sorted.sort((a, b) =>
                    (b.processed.width * b.processed.height) -
                    (a.processed.width * a.processed.height)
                );
                break;
            case 'height':
                sorted.sort((a, b) => b.processed.height - a.processed.height);
                break;
            case 'width':
                sorted.sort((a, b) => b.processed.width - a.processed.width);
                break;
            case 'none':
            default:
                // Keep original order
                break;
        }

        return sorted;
    }

    private estimateInitialSize(frames: ProcessedFrame[], maxSize?: Size): Size {
        let totalArea = 0;
        let maxWidth = 0;
        let maxHeight = 0;

        for (const frame of frames) {
            const width = frame.processed.width + this.options.spacing;
            const height = frame.processed.height + this.options.spacing;
            totalArea += width * height;
            maxWidth = Math.max(maxWidth, width);
            maxHeight = Math.max(maxHeight, height);
        }

        // Estimate square size
        const estimatedSize = Math.ceil(Math.sqrt(totalArea) * 1.2);

        return {
            width: maxSize?.width || Math.max(estimatedSize, maxWidth),
            height: maxSize?.height || Math.max(estimatedSize, maxHeight),
        };
    }

    private findBestRect(
        freeRects: Rect[],
        width: number,
        height: number
    ): { rect: Rect; index: number } | null {
        let bestRect: Rect | null = null;
        let bestIndex = -1;
        let bestScore = Infinity;

        for (let i = 0; i < freeRects.length; i++) {
            const rect = freeRects[i];

            if (rect.width >= width && rect.height >= height) {
                // Use best short side fit heuristic
                const leftoverX = rect.width - width;
                const leftoverY = rect.height - height;
                const score = Math.min(leftoverX, leftoverY);

                if (score < bestScore) {
                    bestScore = score;
                    bestRect = rect;
                    bestIndex = i;
                }
            }
        }

        return bestRect ? { rect: bestRect, index: bestIndex } : null;
    }

    private splitRect(
        freeRects: Rect[],
        index: number,
        usedWidth: number,
        usedHeight: number
    ): void {
        const rect = freeRects[index];
        freeRects.splice(index, 1);

        // Create new free rectangles
        const rightRect: Rect = {
            x: rect.x + usedWidth,
            y: rect.y,
            width: rect.width - usedWidth,
            height: rect.height,
        };

        const bottomRect: Rect = {
            x: rect.x,
            y: rect.y + usedHeight,
            width: rect.width,
            height: rect.height - usedHeight,
        };

        if (rightRect.width > 0 && rightRect.height > 0) {
            freeRects.push(rightRect);
        }

        if (bottomRect.width > 0 && bottomRect.height > 0) {
            freeRects.push(bottomRect);
        }

        // Merge overlapping free rectangles
        this.mergeRects(freeRects);
    }

    private mergeRects(freeRects: Rect[]): void {
        // Simple merge: remove contained rectangles
        for (let i = 0; i < freeRects.length; i++) {
            for (let j = i + 1; j < freeRects.length; j++) {
                if (this.contains(freeRects[i], freeRects[j])) {
                    freeRects.splice(j, 1);
                    j--;
                } else if (this.contains(freeRects[j], freeRects[i])) {
                    freeRects.splice(i, 1);
                    i--;
                    break;
                }
            }
        }
    }

    private contains(a: Rect, b: Rect): boolean {
        return a.x <= b.x &&
            a.y <= b.y &&
            a.x + a.width >= b.x + b.width &&
            a.y + a.height >= b.y + b.height;
    }
}