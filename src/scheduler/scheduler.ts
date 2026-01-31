import * as cron from "node-cron";
import { logger } from "../config/logger";

export interface Job {
  name(): string;
  run(): Promise<void>;
  cleanup?(): void; // Optional cleanup method for timers/resources
}

export class Scheduler {
  private jobs: Map<string, cron.ScheduledTask> = new Map();
  private jobInstances: Map<string, Job> = new Map(); // Track job instances for cleanup
  private runningJobs = new Map<string, Promise<void>>();
  private timers = new Set<NodeJS.Timeout>();

  constructor() {
    // EventBus is accessed via getEventBus() when needed in jobs
  }

  public addJob(job: Job): void {
    const jobName = job.name();
    
    // Run immediately on start with overlap prevention
    logger.info(`Running job immediately: ${jobName}`);
    this.executeJob(jobName, job);

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
    const midnightTimer = setTimeout(() => {
      logger.info(`Running job at midnight: ${jobName}`);
      this.executeJob(jobName, job);
    }, initialDelay);
    
    this.timers.add(midnightTimer);

    // Then run every 24 hours (at midnight)
    const task = cron.schedule("0 0 * * *", () => {
      logger.info(`Running scheduled job: ${jobName}`);
      this.executeJob(jobName, job);
    });

    this.jobs.set(jobName, task);
    this.jobInstances.set(jobName, job); // Store job instance for cleanup
    logger.info(`Job ${jobName} added to scheduler`);
  }

  private executeJob(jobName: string, job: Job): void {
    // Check if job is already running
    if (this.runningJobs.has(jobName)) {
      logger.warn(`Job ${jobName} is still running, skipping this iteration`);
      return;
    }

    // Execute job with tracking
    const promise = job
      .run()
      .catch((err) => {
        logger.error(`Job ${jobName} failed`, { error: err.message, stack: err.stack });
      })
      .finally(() => {
        this.runningJobs.delete(jobName);
      });

    this.runningJobs.set(jobName, promise);
  }

  public start(): void {
    logger.info(`Starting scheduler with ${this.jobs.size} job(s)`);
    this.jobs.forEach((task, name) => {
      task.start();
      logger.info(`Job ${name} started`);
    });
  }

  public async stop(): Promise<void> {
    logger.info("Stopping scheduler...");
    
    // Stop all cron tasks
    this.jobs.forEach((task, name) => {
      task.stop();
      logger.info(`Job ${name} stopped`);
    });
    
    // Clear all scheduler timers
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
    logger.info("All scheduler timers cleared");

    // Call cleanup on all job instances
    this.jobInstances.forEach((job, name) => {
      if (job.cleanup) {
        logger.info(`Cleaning up job: ${name}`);
        job.cleanup();
      }
    });

    // Wait for running jobs to complete with timeout
    if (this.runningJobs.size > 0) {
      logger.info(`Waiting for ${this.runningJobs.size} running jobs to complete...`);
      const timeout = 30000; // 30 seconds
      const runningJobPromises = Array.from(this.runningJobs.values());

      await Promise.race([
        Promise.all(runningJobPromises),
        new Promise((resolve) => setTimeout(resolve, timeout)),
      ]);

      if (this.runningJobs.size > 0) {
        logger.warn(`${this.runningJobs.size} jobs still running after timeout`);
      }
    }

    this.jobs.clear();
    logger.info("All jobs stopped");
  }
}
