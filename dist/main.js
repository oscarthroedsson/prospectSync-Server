"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./server/app");
const server_1 = require("./server/server");
const event_bus_1 = require("./eventbus/event-bus");
const listeners_1 = require("./listeners");
const scheduler_1 = require("./scheduler/scheduler");
const daily_job_posting_check_job_1 = require("./scheduler/jobs/daily-job-posting-check.job");
const daily_reminder_check_job_1 = require("./scheduler/jobs/daily-reminder-check.job");
const router_1 = require("./router");
const error_middleware_1 = require("./middleware/error.middleware");
const database_1 = require("./config/database");
async function main() {
    console.log("🚀 [Main] Starting application...");
    // Initialize event bus
    const bus = (0, event_bus_1.getEventBus)();
    console.log("✅ [Main] Event bus initialized");
    // Start all event listeners
    (0, listeners_1.startAllListeners)(bus);
    console.log("✅ [Main] Event listeners started");
    // Setup and start cron jobs
    const scheduler = new scheduler_1.Scheduler();
    const dailyJobPostingCheck = new daily_job_posting_check_job_1.DailyJobPostingCheck();
    scheduler.addJob(dailyJobPostingCheck);
    console.log("✅ [Main] Daily job posting check job added");
    const dailyReminderCheck = new daily_reminder_check_job_1.DailyReminderCheck();
    scheduler.addJob(dailyReminderCheck);
    console.log("✅ [Main] Daily reminder check job added");
    scheduler.start();
    console.log("✅ [Main] Scheduler started with all cron jobs");
    // Create Express app
    const app = (0, app_1.createApp)();
    // Register routes
    (0, router_1.registerRoutes)(app);
    // Error handling middleware (must be last)
    app.use(error_middleware_1.errorMiddleware);
    // Create HTTP server
    const httpServer = new server_1.HttpServer(app);
    // Graceful shutdown
    const shutdown = async (signal) => {
        console.log(`🛑 [Shutdown] ${signal} received, shutting down gracefully...`);
        // Stop scheduler
        scheduler.stop();
        // Close HTTP server
        await httpServer.stop();
        // Disconnect database
        await (0, database_1.disconnectDatabase)();
        console.log("✅ [Shutdown] Graceful shutdown complete");
        process.exit(0);
    };
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
    // Start HTTP server
    await httpServer.start();
    console.log("✅ [Main] Application started successfully");
}
// Run main function
main().catch((error) => {
    console.error("❌ [Main] Fatal error:", error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map