export interface Job {
    name(): string;
    run(): Promise<void>;
}
export declare class Scheduler {
    private jobs;
    constructor();
    addJob(job: Job): void;
    start(): void;
    stop(): void;
}
//# sourceMappingURL=scheduler.d.ts.map