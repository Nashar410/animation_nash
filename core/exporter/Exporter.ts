
// core/exporter/Exporter.ts
import { IExporter } from '@shared/interfaces';
import {
    ProcessedFrame,
    ExportSettings,
    ExportResult,
    ExportFormat,
    ValidationResult,
    ExportMetadata,
    FrameMetadata,
    AnimationMetadata,
} from '@shared/types';
import { SpritesheetGenerator } from '../spritesheet-generator';
import { LayoutFactory } from '@core/spritesheet-generator';
import {Logger} from "@shared/utils/logger.ts";

export abstract class Exporter implements IExporter {
    protected logger: Logger;
    protected spritesheetGenerator: SpritesheetGenerator;

    constructor(protected name: string) {
        this.logger = new Logger(`Exporter:${name}`);
        this.spritesheetGenerator = new SpritesheetGenerator();
    }

    abstract export(
        frames: ProcessedFrame[],
        settings: ExportSettings
    ): Promise<ExportResult>;

    abstract getSupportedFormats(): ExportFormat[];

    validateExport(frames: ProcessedFrame[], settings: ExportSettings): ValidationResult {
        const errors = [];
        const warnings = [];

        if (frames.length === 0) {
            errors.push({
                code: 'NO_FRAMES',
                message: 'No frames to export',
            });
        }

        if (!this.getSupportedFormats().includes(settings.format)) {
            errors.push({
                code: 'UNSUPPORTED_FORMAT',
                message: `Format ${settings.format} is not supported by ${this.name} exporter`,
            });
        }

        // Check frame sizes
        const firstFrame = frames[0];
        const inconsistentSizes = frames.some(
            f =>
                f.processed.width !== firstFrame.processed.width ||
                f.processed.height !== firstFrame.processed.height
        );

        if (inconsistentSizes) {
            warnings.push({
                code: 'INCONSISTENT_SIZES',
                message: 'Frames have different sizes, layout may be affected',
            });
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings,
        };
    }

    estimateFileSize(frames: ProcessedFrame[], settings: ExportSettings): number {
        if (frames.length === 0) return 0;

        // Calculate total pixel count
        const layout = LayoutFactory.create(settings.layout);
        const totalSize = layout.getTotalSize(frames);
        const pixelCount = totalSize.width * totalSize.height;

        // Estimate based on format
        let bytesPerPixel = 4; // RGBA
        let compressionRatio = 1;

        switch (settings.format) {
            case 'png':
                compressionRatio = 0.5; // PNG compression estimate
                break;
            case 'webp':
                compressionRatio = settings.compression ? 1 - settings.compression : 0.3;
                break;
            case 'gif':
                bytesPerPixel = 1; // Indexed color
                compressionRatio = 0.7;
                break;
            case 'json':
                // Rough estimate for JSON metadata
                return frames.length * 1000;
        }

        return Math.ceil(pixelCount * bytesPerPixel * compressionRatio);
    }

    protected generateMetadata(
        frames: ProcessedFrame[],
        settings: ExportSettings
    ): ExportMetadata {
        const layout = LayoutFactory.create(settings.layout);
        const layoutResult = layout.calculate(frames);

        const frameMetadata: FrameMetadata[] = layoutResult.positions.map((pos, index) => ({
            index,
            x: pos.x,
            y: pos.y,
            width: pos.width,
            height: pos.height,
        }));

        // Group frames by animation
        const animations: AnimationMetadata[] = [];
        let currentAnimation: AnimationMetadata | null = null;
        let lastAnimationName = '';

        frames.forEach((frame, index) => {
            if (frame.animationName && frame.animationName !== lastAnimationName) {
                if (currentAnimation) {
                    animations.push(currentAnimation);
                }
                currentAnimation = {
                    name: frame.animationName,
                    startFrame: index,
                    endFrame: index,
                    loop: true,
                    fps: 30,
                };
                lastAnimationName = frame.animationName;
            } else if (currentAnimation) {
                currentAnimation.endFrame = index;
            }
        });

        if (currentAnimation) {
            animations.push(currentAnimation);
        }

        return {
            frames: frameMetadata,
            animations,
            settings,
            created: new Date(),
        };
    }
}