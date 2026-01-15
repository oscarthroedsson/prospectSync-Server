import { Job } from "../scheduler";
export declare class DailyJobPostingCheck implements Job {
    private repo;
    private bus;
    private daysAhead;
    name(): string;
    run(): Promise<void>;
    private checkExpired;
    private checkExpiringSoon;
}
//# sourceMappingURL=daily-job-posting-check.job.d.ts.map