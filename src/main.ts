import { DailyJobPostingCheck } from "./scheduler/jobs/daily-job-posting-check.job";
import { DailyReminderCheck } from "./scheduler/jobs/daily-reminder-check.job";
import { errorMiddleware } from "./middleware/error.middleware";
import { getBrowserPool } from "./utils/web/browser-pool";
import { Scheduler } from "./scheduler/scheduler";
import { getEventBus } from "./eventbus/event-bus";
import { disconnectDatabase } from "./config/prisma";
import { HttpServer } from "./server/server";
import { createApp } from "./server/app";
import { startAllListeners } from "./listeners";
import { registerRoutes } from "./router";
import { ProcessErrorHandler } from "./utils/process-error-handler";
import { getBackgroundJobTracker } from "./utils/background-job-tracker";
import { logger } from "./config/logger";

async function main() {
  logger.info("Starting application...");

  // Initialize event bus
  const bus = getEventBus();
  logger.info("Event bus initialized");

  // Start all event listeners
  startAllListeners(bus);
  logger.info("Event listeners started");

  // Setup and start cron jobs
  const scheduler = new Scheduler();

  const dailyJobPostingCheck = new DailyJobPostingCheck();
  scheduler.addJob(dailyJobPostingCheck);
  logger.info("Daily job posting check job added");

  const dailyReminderCheck = new DailyReminderCheck();
  scheduler.addJob(dailyReminderCheck);
  logger.info("Daily reminder check job added");

  scheduler.start();
  logger.info("Scheduler started with all cron jobs");

  // Create Express app
  const app = createApp();

  /*
  ? Add global middlewares here? rate-limit 
  ƒ Auth should be added to specific routes 
  */
  // Register routes
  registerRoutes(app);

  // Error handling middleware (must be last)
  app.use(errorMiddleware);

  // Create HTTP server
  const httpServer = new HttpServer(app);

  // Graceful shutdown function
  const gracefulShutdown = async () => {
    logger.info("Shutting down gracefully...");

    // Wait for background jobs to complete
    const jobTracker = getBackgroundJobTracker();
    await jobTracker.gracefulShutdown(30000);

    // Stop scheduler and wait for running jobs
    await scheduler.stop();

    // Cleanup event bus
    bus.cleanup();
    logger.info("Event bus cleaned up");

    // Close browser pool
    const browserPool = getBrowserPool();
    await browserPool.closeAll();
    logger.info("Browser pool closed");

    // Close HTTP server
    await httpServer.stop();

    // Disconnect database
    await disconnectDatabase();

    logger.info("Graceful shutdown complete");
  };

  // Register process error handlers
  const errorHandler = new ProcessErrorHandler();
  errorHandler.register(gracefulShutdown);

  // Start HTTP server
  await httpServer.start();
  logger.info("Application started successfully");

  // emptyQdrantCollection();
}

// Run main function
main().catch((error) => {
  logger.error("Fatal error", { error: error.message, stack: error.stack });
  process.exit(1);
});
