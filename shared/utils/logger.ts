// shared/utils/logger.ts
export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
}

export class Logger {
    constructor(
        private name: string,
        private level: LogLevel = LogLevel.INFO
    ) {}

    debug(message: string, ...args: unknown[]): void {
        if (this.level <= LogLevel.DEBUG && process.env.NODE_ENV === 'development') {
            console.debug(`[${this.name}] ${message}`, ...args);
        }
    }
    info(message: string, ...args: unknown[]): void {
        if (this.level <= LogLevel.INFO && process.env.NODE_ENV === 'development') {
            console.info(`[${this.name}] ${message}`, ...args);
        }
    }

    warn(message: string, ...args: unknown[]): void {
        if (this.level <= LogLevel.WARN) {
            console.warn(`[${this.name}] ${message}`, ...args);
        }
    }

    error(message: string, ...args: unknown[]): void {
        if (this.level <= LogLevel.ERROR) {
            console.error(`[${this.name}] ${message}`, ...args);
        }
    }
}