
// core/pipeline/RenderPipeline.ts
import {
    IModelLoader,
    IRenderer,
    IPixelProcessor,
    IExporter,
    IEventBus
} from '@shared/interfaces';
import {
    Model3D,
    Camera,
    RenderSettings,
    PixelSettings,
    ExportSettings,
    ExportResult,
    ProcessedFrame,
} from '@shared/types';
import {PerformanceMonitor} from "@shared/utils/performance.ts";
import {Logger} from "@shared/utils/logger.ts";
import {AppEvents} from "@shared/events/events.ts";


export interface PipelineSettings {
    camera: Camera;
    renderSettings: Partial<RenderSettings>;
    pixelSettings: PixelSettings;
    exportSettings: ExportSettings;
}

export interface PipelineProgress {
    stage: 'loading' | 'rendering' | 'processing' | 'exporting' | 'complete';
    current: number;
    total: number;
    message: string;
}

export class RenderPipeline {
    private logger: Logger;
    private performanceMonitor: PerformanceMonitor;
    private renderCanvas: HTMLCanvasElement;

    constructor(
        private modelLoader: IModelLoader,
        private renderer: IRenderer,
        private pixelProcessor: IPixelProcessor,
        private exporter: IExporter,
        private eventBus?: IEventBus
    ) {
        this.logger = new Logger('RenderPipeline');
        this.performanceMonitor = new PerformanceMonitor();

        // Create offscreen canvas for rendering
        this.renderCanvas = document.createElement('canvas');
        this.renderCanvas.width = 512; // Default size
        this.renderCanvas.height = 512;
    }

    async process(file: File, settings: PipelineSettings): Promise<ExportResult> {
        this.logger.info('Starting pipeline process', { fileName: file.name });
        this.performanceMonitor.mark('pipeline-start');

        try {
            // Stage 1: Load model
            this.updateProgress('loading', 0, 1, 'Loading 3D model...');
            const model = await this.loadModel(file);

            // Stage 2: Render frames
            this.updateProgress('rendering', 0, 1, 'Rendering frames...');
            const frames = await this.renderFrames(model, settings);

            // Stage 3: Process frames
            this.updateProgress('processing', 0, frames.length, 'Converting to pixel art...');
            const processedFrames = await this.processFrames(frames, settings.pixelSettings);

            // Stage 4: Export
            this.updateProgress('exporting', 0, 1, 'Creating spritesheet...');
            const result = await this.exportFrames(processedFrames, settings.exportSettings);

            // Complete
            this.updateProgress('complete', 1, 1, 'Pipeline complete!');
            const totalTime = this.performanceMonitor.measure('pipeline', 'pipeline-start');
            this.logger.info(`Pipeline completed in ${totalTime}ms`);

            return result;
        } catch (error) {
            this.logger.error('Pipeline error', error);
            this.eventBus?.emit(AppEvents.EXPORT_ERROR, error);
            throw error;
        }
    }

    async processWithAnimation(
        file: File,
        animationId: string,
        settings: PipelineSettings
    ): Promise<ExportResult> {
        this.logger.info('Starting pipeline with animation', { fileName: file.name, animationId });

        try {
            // Load model
            this.updateProgress('loading', 0, 1, 'Loading 3D model...');
            const model = await this.loadModel(file);

            // Render animation frames
            this.updateProgress('rendering', 0, 1, 'Rendering animation...');
            const frames = await this.renderAnimation(model, animationId, settings);

            // Process frames
            this.updateProgress('processing', 0, frames.length, 'Converting to pixel art...');
            const processedFrames = await this.processFrames(frames, settings.pixelSettings);

            // Export
            this.updateProgress('exporting', 0, 1, 'Creating spritesheet...');
            const result = await this.exportFrames(processedFrames, settings.exportSettings);

            this.updateProgress('complete', 1, 1, 'Animation export complete!');
            return result;
        } catch (error) {
            this.logger.error('Pipeline error', error);
            throw error;
        }
    }

    private async loadModel(file: File): Promise<Model3D> {
        this.eventBus?.emit(AppEvents.MODEL_LOADED, { fileName: file.name });

        const model = await this.modelLoader.loadModel(file);
        const validation = this.modelLoader.validateModel(model);

        if (!validation.valid) {
            throw new Error(`Invalid model: ${validation.errors[0].message}`);
        }

        this.eventBus?.emit(AppEvents.MODEL_LOADED, model);
        return model;
    }

    private async renderFrames(
        model: Model3D,
        settings: PipelineSettings
    ): Promise<ImageData[]> {
        // Update canvas size based on render settings
        const renderSize = settings.renderSettings.camera
            ? this.calculateRenderSize(model, settings.camera)
            : { width: 512, height: 512 };

        this.renderCanvas.width = renderSize.width;
        this.renderCanvas.height = renderSize.height;

        // Initialize renderer
        this.renderer.initialize(this.renderCanvas);
        this.renderer.updateSettings(settings.renderSettings);

        // Render single frame for static export
        this.eventBus?.emit(AppEvents.RENDER_START);
        const result = this.renderer.render(model, settings.camera, settings.renderSettings);
        this.eventBus?.emit(AppEvents.RENDER_COMPLETE, result);

        return [result.image];
    }

    private async renderAnimation(
        model: Model3D,
        animationId: string,
        settings: PipelineSettings
    ): Promise<ImageData[]> {
        // Update canvas size
        const renderSize = this.calculateRenderSize(model, settings.camera);
        this.renderCanvas.width = renderSize.width;
        this.renderCanvas.height = renderSize.height;

        // Initialize renderer
        this.renderer.initialize(this.renderCanvas);
        this.renderer.updateSettings(settings.renderSettings);

        // Render animation frames
        const frames: ImageData[] = [];
        this.eventBus?.emit(AppEvents.RENDER_START);

        let frameCount = 0;
        for await (const result of this.renderer.renderAnimation(
            model,
            animationId,
            settings.camera,
            settings.renderSettings
        )) {
            frames.push(result.image);
            frameCount++;
            this.updateProgress('rendering', frameCount, 0, `Rendering frame ${frameCount}...`);
            this.eventBus?.emit(AppEvents.RENDER_PROGRESS, { current: frameCount });
        }

        this.eventBus?.emit(AppEvents.RENDER_COMPLETE, { frameCount });
        return frames;
    }

    private async processFrames(
        frames: ImageData[],
        pixelSettings: PixelSettings
    ): Promise<ProcessedFrame[]> {
        this.eventBus?.emit(AppEvents.PROCESS_START);

        const processedFrames: ProcessedFrame[] = [];

        for (let i = 0; i < frames.length; i++) {
            const processed = await this.pixelProcessor.process(frames[i], pixelSettings);
            processed.frameNumber = i;
            processedFrames.push(processed);

            this.updateProgress('processing', i + 1, frames.length, `Processing frame ${i + 1}/${frames.length}...`);
            this.eventBus?.emit(AppEvents.PROCESS_PROGRESS, {
                current: i + 1,
                total: frames.length
            });
        }

        this.eventBus?.emit(AppEvents.PROCESS_COMPLETE, processedFrames);
        return processedFrames;
    }

    private async exportFrames(
        frames: ProcessedFrame[],
        exportSettings: ExportSettings
    ): Promise<ExportResult> {
        this.eventBus?.emit(AppEvents.EXPORT_START);

        const result = await this.exporter.export(frames, exportSettings);

        this.eventBus?.emit(AppEvents.EXPORT_COMPLETE, result);
        return result;
    }

    private calculateRenderSize(model: Model3D, camera: Camera): { width: number; height: number } {
        // Calculate optimal render size based on model bounds and camera
        const aspectRatio = model.bounds.size.x / model.bounds.size.y;
        const baseSize = 512;

        if (aspectRatio > 1) {
            return { width: baseSize, height: Math.round(baseSize / aspectRatio) };
        } else {
            return { width: Math.round(baseSize * aspectRatio), height: baseSize };
        }
    }

    private updateProgress(
        stage: PipelineProgress['stage'],
        current: number,
        total: number,
        message: string
    ): void {
        const progress: PipelineProgress = { stage, current, total, message };
        this.logger.debug(`Progress: ${stage} - ${message}`);
        this.eventBus?.emit('pipeline:progress', progress);
    }

    dispose(): void {
        this.modelLoader.dispose();
        this.renderer.dispose();
        this.pixelProcessor.dispose();
    }
}