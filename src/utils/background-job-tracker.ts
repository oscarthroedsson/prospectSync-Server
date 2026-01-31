import { logger } from "../config/logger";

/**
 * BackgroundJobTracker
 * Spårar background operationer och tillåter graceful shutdown
 */
export class BackgroundJobTracker {
  private jobs = new Map<string, { promise: Promise<void>; abort: () => void }>();

  /**
   * Track a background job with abort capability
   * @param jobId Unique identifier for the job
   * @param work The work to perform, receives an AbortSignal
   * @returns Promise that resolves with the work result
   */
  async track<T>(jobId: string, work: (signal: AbortSignal) => Promise<T>): Promise<T> {
    const controller = new AbortController();

    const promise = work(controller.signal).finally(() => {
      this.jobs.delete(jobId);
    });

    this.jobs.set(jobId, {
      promise: promise as unknown as Promise<void>,
      abort: () => controller.abort(),
    });

    return promise;
  }

  /**
   * Get current job stats
   */
  getStats() {
    return {
      active: this.jobs.size,
      jobs: Array.from(this.jobs.keys()),
    };
  }

  /**
   * Wait for all jobs to complete with timeout, then abort remaining
   * @param timeout Max time to wait in milliseconds (default 30s)
   */
  async gracefulShutdown(timeout = 30000): Promise<void> {
    if (this.jobs.size === 0) {
      logger.info("No active background jobs");
      return;
    }

    logger.info(`Waiting for ${this.jobs.size} background jobs to complete...`);

    const allJobs = Array.from(this.jobs.values()).map((j) => j.promise);

    await Promise.race([Promise.all(allJobs), new Promise((resolve) => setTimeout(resolve, timeout))]);

    // Abort any remaining jobs
    const remaining = this.jobs.size;
    if (remaining > 0) {
      logger.warn(`Aborting ${remaining} remaining jobs after timeout`);
      this.jobs.forEach((job) => job.abort());
    } else {
      logger.info("All background jobs completed");
    }
  }
}

// Singleton instance
let instance: BackgroundJobTracker | null = null;

export function getBackgroundJobTracker(): BackgroundJobTracker {
  if (!instance) instance = new BackgroundJobTracker();

  return instance;
}
