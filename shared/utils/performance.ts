// shared/utils/performance.ts
export class PerformanceMonitor {
    private marks: Map<string, number> = new Map();

    mark(name: string): void {
        this.marks.set(name, performance.now());
    }

    measure(name: string, startMark: string): number {
        const start = this.marks.get(startMark);
        if (!start) {
            throw new Error(`Mark ${startMark} not found`);
        }
        const duration = performance.now() - start;
        console.debug(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
        return duration;
    }

    clear(): void {
        this.marks.clear();
    }
}