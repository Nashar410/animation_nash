import { setupContainer, DI_TOKENS } from '@shared/di';
import { GLBLoader } from '@core/model-loader';
import { ThreeRenderer } from '@rendering/three-renderer';
import { SimplePixelProcessor } from '@core/pixel-processor';
import { AlgorithmFactory } from '@core/pixel-processor/algorithms/AlgorithmFactory';
import { ExporterFactory } from '@core/exporter';

export function setupDI() {
  const container = setupContainer();

  // Register services
  container.register(DI_TOKENS.MODEL_LOADER, () => new GLBLoader());
  container.register(DI_TOKENS.RENDERER, () => new ThreeRenderer());
  container.register(
    DI_TOKENS.PIXEL_PROCESSOR,
    () => new SimplePixelProcessor(AlgorithmFactory.create('nearest-neighbor'))
  );
  container.register(DI_TOKENS.EXPORTER, () => ExporterFactory.create('png'));

  return container;
}
