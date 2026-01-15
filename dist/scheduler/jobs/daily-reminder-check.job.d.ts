import { Job } from "../scheduler";
export declare class DailyReminderCheck implements Job {
    private triggerService;
    private bus;
    name(): string;
    run(): Promise<void>;
    private isSameDay;
}
//# sourceMappingURL=daily-reminder-check.job.d.ts.map