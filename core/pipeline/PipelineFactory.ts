// core/pipeline/PipelineFactory.ts
import { DI_TOKENS } from '@shared/di/tokens';
import { RenderPipeline } from './RenderPipeline';
import {
    IModelLoader,
    IRenderer,
    IPixelProcessor,
    IExporter,
    IEventBus
} from '@shared/interfaces';
import {DIContainer} from "@shared/di/Container.ts";

export class PipelineFactory {
    static create(container: DIContainer): RenderPipeline {
        const modelLoader = container.resolve<IModelLoader>(DI_TOKENS.MODEL_LOADER);
        const renderer = container.resolve<IRenderer>(DI_TOKENS.RENDERER);
        const pixelProcessor = container.resolve<IPixelProcessor>(DI_TOKENS.PIXEL_PROCESSOR);
        const exporter = container.resolve<IExporter>(DI_TOKENS.EXPORTER);
        const eventBus = container.resolve<IEventBus>(DI_TOKENS.EVENT_BUS);

        return new RenderPipeline(
            modelLoader,
            renderer,
            pixelProcessor,
            exporter,
            eventBus
        );
    }
}