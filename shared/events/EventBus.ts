// shared/events/EventBus.ts

import {EventHandler, IEventBus} from "@shared/interfaces";

export class EventBus implements IEventBus {
    private events: Map<string, Set<EventHandler>> = new Map();

    on<T>(event: string, handler: EventHandler<T>): void {
        if (!this.events.has(event)) {
            this.events.set(event, new Set());
        }
        const handlers = this.events.get(event);
        if (handlers) {
            handlers.add(handler);
        }
    }

    off<T>(event: string, handler: EventHandler<T>): void {
        const handlers = this.events.get(event);
        if (handlers) {
            handlers.delete(handler);
            if (handlers.size === 0) {
                this.events.delete(event);
            }
        }
    }

    emit<T>(event: string, data?: T): void {
        const handlers = this.events.get(event);
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`Error in event handler for ${event}:`, error);
                }
            });
        }
    }

    once<T>(event: string, handler: EventHandler<T>): void {
        const wrappedHandler: EventHandler<T> = (data) => {
            handler(data);
            this.off(event, wrappedHandler);
        };
        this.on(event, wrappedHandler);
    }

    clear(): void {
        this.events.clear();
    }
}
