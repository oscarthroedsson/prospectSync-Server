import * as cron from "node-cron";

export interface Job {
  name(): string;
  run(): Promise<void>;
}

export class Scheduler {
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  constructor() {
    // EventBus is accessed via getEventBus() when needed in jobs
  }

  public addJob(job: Job): void {
    const jobName = job.name();
    
    // Run immediately on start
    console.log(`⏰ [Scheduler] Running job immediately: ${jobName}`);
    job.run().catch((err) => {
      console.error(`❌ [Scheduler] Job ${jobName} failed:`, err);
    });

    // Calculate time until next midnight
    const now = new Date();
    const midnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      0,
      0
    );
    const initialDelay = midnight.getTime() - now.getTime();

    // Schedule first run at midnight
    setTimeout(() => {
      console.log(`⏰ [Scheduler] Running job at midnight: ${jobName}`);
      job.run().catch((err) => {
        console.error(`❌ [Scheduler] Job ${jobName} failed:`, err);
      });
    }, initialDelay);

    // Then run every 24 hours (at midnight)
    const task = cron.schedule("0 0 * * *", () => {
      console.log(`⏰ [Scheduler] Running job: ${jobName}`);
      job.run().catch((err) => {
        console.error(`❌ [Scheduler] Job ${jobName} failed:`, err);
      });
    });

    this.jobs.set(jobName, task);
    console.log(`✅ [Scheduler] Job ${jobName} added`);
  }

  public start(): void {
    console.log(`🚀 [Scheduler] Starting scheduler with ${this.jobs.size} job(s)`);
    this.jobs.forEach((task, name) => {
      task.start();
      console.log(`✅ [Scheduler] Job ${name} started`);
    });
  }

  public stop(): void {
    console.log("🛑 [Scheduler] Stopping scheduler...");
    this.jobs.forEach((task, name) => {
      task.stop();
      console.log(`✅ [Scheduler] Job ${name} stopped`);
    });
    this.jobs.clear();
    console.log("✅ [Scheduler] All jobs stopped");
  }
}
