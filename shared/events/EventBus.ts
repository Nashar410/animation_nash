// shared/events/EventBus.ts

import { EventHandler, IEventBus } from "@shared/interfaces";

export class EventBus implements IEventBus {
    // On stocke tous les handlers comme EventHandler<unknown>
    private events: Map<string, Set<EventHandler<unknown>>> = new Map();

    on<T>(event: string, handler: EventHandler<T>): void {
        // récupère (ou crée) l’ensemble de handlers pour cet événement
        let handlers = this.events.get(event);
        if (!handlers) {
            handlers = new Set<EventHandler<unknown>>();
            this.events.set(event, handlers);
        }
        // on sait que handlers n’est pas undefined
        handlers.add(handler as EventHandler<unknown>);
    }


    off<T>(event: string, handler: EventHandler<T>): void {
        const handlers = this.events.get(event);
        if (!handlers) return;
        handlers.delete(handler as EventHandler<unknown>);
        if (handlers.size === 0) {
            this.events.delete(event);
        }
    }

    emit<T>(event: string, data?: T): void {
        const handlers = this.events.get(event);
        if (!handlers) return;
        handlers.forEach(h => {
            try {
                (h as EventHandler<T>)(data as T);
            } catch (err) {
                console.error(`Error in event handler for ${event}:`, err);
            }
        });
    }


    once<T>(event: string, handler: EventHandler<T>): void {
        const wrapped: EventHandler<T> = (data) => {
            handler(data);
            this.off(event, wrapped);
        };
        this.on(event, wrapped);
    }

    clear(): void {
        this.events.clear();
    }
}
