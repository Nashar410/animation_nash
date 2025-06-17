import { ModelLoader } from '@core/model-loader/ModelLoader';
// core/pixel-processor/PixelProcessor.ts
import { IPixelProcessor, IPixelAlgorithm } from '@shared/interfaces';
import { ProcessedFrame, PixelSettings, PixelAlgorithm } from '@shared/types/pixelart';
import {PerformanceMonitor} from "@shared/utils/performance.ts";
import {Logger} from "@shared/utils/logger.ts";

export abstract class PixelProcessor implements IPixelProcessor {
    protected logger: Logger;
    protected performanceMonitor: PerformanceMonitor;
    protected algorithm: IPixelAlgorithm;

    constructor(
        protected name: string,
        algorithm: IPixelAlgorithm
    ) {
        this.logger = new Logger(`PixelProcessor:${name}`);
        this.performanceMonitor = new PerformanceMonitor();
        this.algorithm = algorithm;
    }

    async process(input: ImageData, settings: PixelSettings): Promise<ProcessedFrame> {
        this.logger.info('Processing frame', {
            inputSize: `${input.width}x${input.height}`,
            targetSize: `${settings.targetSize.width}x${settings.targetSize.height}`
        });

        this.performanceMonitor.mark('process-start');

        try {
            const processed = await this.processImage(input, settings);
            const processingTime = this.performanceMonitor.measure('process', 'process-start');

            return {
                id: ModelLoader.generateId('frame'),
                original: input,
                processed,
                frameNumber: 0,
                processingTime,
            };
        } catch (error) {
            this.logger.error('Failed to process frame', error);
            throw error;
        }
    }

    async processBatch(
        inputs: ImageData[],
        settings: PixelSettings
    ): Promise<ProcessedFrame[]> {
        this.logger.info(`Processing batch of ${inputs.length} frames`);

        const results: ProcessedFrame[] = [];

        for (let i = 0; i < inputs.length; i++) {
            const frame = await this.process(inputs[i], settings);
            frame.frameNumber = i;
            results.push(frame);
        }

        return results;
    }

    getAlgorithm(): PixelAlgorithm {
        return this.algorithm.name as PixelAlgorithm;
    }

    setAlgorithm(algorithm: IPixelAlgorithm): void {
        this.algorithm = algorithm;
        this.logger.info(`Algorithm changed to: ${algorithm.name}`);
    }

    dispose(): void {
        this.performanceMonitor.clear();
    }

    protected abstract processImage(
        input: ImageData,
        settings: PixelSettings
    ): Promise<ImageData>;
}