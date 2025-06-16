// core/spritesheet-generator/SpritesheetGenerator.ts


import {Logger} from "@shared/utils/logger.ts";
import {ProcessedFrame} from "@shared/types/pixelart.ts";
import {FramePosition, ILayout} from "@shared/interfaces";
import {Size} from "@shared/types/rendering.ts";

export class SpritesheetGenerator {
    private logger: Logger;

    constructor() {
        this.logger = new Logger('SpritesheetGenerator');
    }

    generate(
        frames: ProcessedFrame[],
        layout: ILayout,
        settings?: SpritesheetSettings
    ): HTMLCanvasElement {
        this.logger.info(`Generating spritesheet with ${frames.length} frames`);

        if (frames.length === 0) {
            throw new Error('No frames provided');
        }

        // Calculate layout
        const layoutResult = layout.calculate(frames, settings?.maxSize);

        // Create canvas
        const canvas = this.createCanvas(layoutResult.totalSize);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Failed to get canvas context');
        }

        // Apply background
        if (settings?.backgroundColor) {
            ctx.fillStyle = settings.backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Draw frames
        this.drawFrames(ctx, frames, layoutResult.positions);

        return canvas;
    }

    async generateBlob(
        frames: ProcessedFrame[],
        layout: ILayout,
        settings?: SpritesheetSettings
    ): Promise<Blob> {
        const canvas = this.generate(frames, layout, settings);

        return new Promise((resolve, reject) => {
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to create blob'));
                    }
                },
                settings?.format || 'image/png',
                settings?.quality || 1.0
            );
        });
    }

    private createCanvas(size: Size): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        canvas.width = size.width;
        canvas.height = size.height;
        return canvas;
    }

    private drawFrames(
        ctx: CanvasRenderingContext2D,
        frames: ProcessedFrame[],
        positions: FramePosition[]
    ): void {
        const frameMap = new Map(frames.map(f => [f.id, f]));

        for (const position of positions) {
            const frame = frameMap.get(position.frameId);
            if (!frame) {
                this.logger.warn(`Frame not found: ${position.frameId}`);
                continue;
            }

            // Create temporary canvas for the frame
            const tempCanvas = this.createCanvas({
                width: frame.processed.width,
                height: frame.processed.height,
            });
            const tempCtx = tempCanvas.getContext('2d');
            if (!tempCtx) continue;

            // Draw frame to temporary canvas
            tempCtx.putImageData(frame.processed, 0, 0);

            // Draw to main canvas at calculated position
            ctx.drawImage(
                tempCanvas,
                position.x,
                position.y,
                position.width,
                position.height
            );
        }
    }
}

export interface SpritesheetSettings {
    backgroundColor?: string;
    format?: 'image/png' | 'image/webp' | 'image/jpeg';
    quality?: number;
    maxSize?: Size;
}