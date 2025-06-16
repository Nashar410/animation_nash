
// shared/interfaces/IWorker.ts
export interface IWorkerMessage<T = unknown> {
    id: string;
    type: string;
    payload: T;
}

export interface IWorkerResponse<T = unknown> {
    id: string;
    success: boolean;
    result?: T;
    error?: string;
}

export interface IWorkerPool {
    /**
     * Exécute une tâche sur un worker disponible
     */
    execute<T, R>(task: IWorkerMessage<T>): Promise<R>;

    /**
     * Termine tous les workers
     */
    terminate(): void;

    /**
     * Retourne le nombre de workers actifs
     */
    getActiveCount(): number;
}
