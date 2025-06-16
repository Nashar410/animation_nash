// shared/di/tokens.ts
export const DI_TOKENS = {
    // Core services
    MODEL_LOADER: Symbol('ModelLoader'),
    RENDERER: Symbol('Renderer'),
    PIXEL_PROCESSOR: Symbol('PixelProcessor'),
    EXPORTER: Symbol('Exporter'),

    // Infrastructure
    EVENT_BUS: Symbol('EventBus'),
    WORKER_POOL: Symbol('WorkerPool'),

    // Presets
    PRESET_FACTORY: Symbol('PresetFactory'),

    // Algorithms
    PIXEL_ALGORITHM_FACTORY: Symbol('PixelAlgorithmFactory'),

    // Layouts
    LAYOUT_FACTORY: Symbol('LayoutFactory'),
} as const;