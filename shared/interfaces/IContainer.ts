
// shared/interfaces/IContainer.ts
export interface IContainer {
    /**
     * Enregistre un service
     */
    register<T>(token: symbol, factory: () => T): void;

    /**
     * Enregistre un singleton
     */
    registerSingleton<T>(token: symbol, factory: () => T): void;

    /**
     * Résout un service
     */
    resolve<T>(token: symbol): T;

    /**
     * Vérifie si un service est enregistré
     */
    has(token: symbol): boolean;
}