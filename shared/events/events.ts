
// shared/events/events.ts
export const AppEvents = {
    MODEL_LOADED: 'model:loaded',
    MODEL_ERROR: 'model:error',
    RENDER_START: 'render:start',
    RENDER_COMPLETE: 'render:complete',
    RENDER_PROGRESS: 'render:progress',
    PROCESS_START: 'process:start',
    PROCESS_COMPLETE: 'process:complete',
    PROCESS_PROGRESS: 'process:progress',
    EXPORT_START: 'export:start',
    EXPORT_COMPLETE: 'export:complete',
    EXPORT_ERROR: 'export:error',
    SETTINGS_CHANGED: 'settings:changed',
    PRESET_CHANGED: 'preset:changed',
} as const;
