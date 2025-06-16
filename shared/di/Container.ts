// shared/di/Container.ts
import { IContainer } from '../interfaces/IContainer.ts';

export class DIContainer implements IContainer {
    private services: Map<symbol, () => unknown> = new Map();
    private singletons: Map<symbol, unknown> = new Map();

    register<T>(token: symbol, factory: () => T): void {
        this.services.set(token, factory);
    }

    registerSingleton<T>(token: symbol, factory: () => T): void {
        this.services.set(token, () => {
            if (!this.singletons.has(token)) {
                this.singletons.set(token, factory());
            }
            return this.singletons.get(token);
        });
    }

    resolve<T>(token: symbol): T {
        const factory = this.services.get(token);
        if (!factory) {
            throw new Error(`Service not found: ${token.toString()}`);
        }
        return factory();
    }

    has(token: symbol): boolean {
        return this.services.has(token);
    }

    clear(): void {
        this.services.clear();
        this.singletons.clear();
    }
}
