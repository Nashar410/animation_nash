
// shared/interfaces/IEventBus.ts
export type EventHandler<T = unknown> = (data: T) => void;

export interface IEventBus {
    /**
     * S'abonne à un événement
     */
    on<T>(event: string, handler: EventHandler<T>): void;

    /**
     * Se désabonne d'un événement
     */
    off<T>(event: string, handler: EventHandler<T>): void;

    /**
     * Émet un événement
     */
    emit<T>(event: string, data?: T): void;

    /**
     * S'abonne pour une seule occurrence
     */
    once<T>(event: string, handler: EventHandler<T>): void;
}