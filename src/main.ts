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

async function main() {
  console.log("🚀 [Main] Starting application...");

  // Initialize event bus
  const bus = getEventBus();
  console.log("✅ [Main] Event bus initialized");

  // Start all event listeners
  startAllListeners(bus);
  console.log("✅ [Main] Event listeners started");

  // Setup and start cron jobs
  const scheduler = new Scheduler();

  const dailyJobPostingCheck = new DailyJobPostingCheck();
  scheduler.addJob(dailyJobPostingCheck);
  console.log("✅ [Main] Daily job posting check job added");

  const dailyReminderCheck = new DailyReminderCheck();
  scheduler.addJob(dailyReminderCheck);
  console.log("✅ [Main] Daily reminder check job added");

  scheduler.start();
  console.log("✅ [Main] Scheduler started with all cron jobs");

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

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`🛑 [Shutdown] ${signal} received, shutting down gracefully...`);

    // Stop scheduler
    scheduler.stop();

    // Close browser pool
    const browserPool = getBrowserPool();
    await browserPool.closeAll();
    console.log("✅ [Shutdown] Browser pool closed");

    // Close HTTP server
    await httpServer.stop();

    // Disconnect database
    await disconnectDatabase();

    console.log("✅ [Shutdown] Graceful shutdown complete");
    process.exit(0);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  // Start HTTP server
  await httpServer.start();
  console.log("✅ [Main] Application started successfully");

  // emptyQdrantCollection();
}

// Run main function
main().catch((error) => {
  console.error("❌ [Main] Fatal error:", error);
  process.exit(1);
});
