import { logger } from "../config/logger";

/**
 * ProcessErrorHandler
 * Hanterar process-level errors och graceful shutdown
 */
export class ProcessErrorHandler {
  private isShuttingDown = false;

  /**
   * Register all process-level error handlers
   * @param shutdownCallback Function to call for graceful shutdown
   */
  register(shutdownCallback: () => Promise<void>): void {
    // Handle unhandled promise rejections
    process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
      logger.error("Unhandled Rejection", { reason, promise });
      // Log but don't exit - depends on severity
      // Could add logic to exit on critical rejections
    });

    // Handle uncaught exceptions - these are critical, should shutdown
    process.on("uncaughtException", (error: Error) => {
      logger.error("Uncaught Exception", { error: error.message, stack: error.stack });
      if (!this.isShuttingDown) {
        this.isShuttingDown = true;
        logger.info("Starting emergency shutdown...");
        shutdownCallback()
          .catch((err) => logger.error("Error during shutdown", { error: err }))
          .finally(() => process.exit(1));
      }
    });

    // Handle SIGTERM (docker stop, kubernetes, etc.)
    process.on("SIGTERM", () => {
      logger.info("Received SIGTERM signal, starting graceful shutdown");
      this.gracefulShutdown(shutdownCallback);
    });

    // Handle SIGINT (Ctrl+C)
    process.on("SIGINT", () => {
      logger.info("Received SIGINT signal, starting graceful shutdown");
      this.gracefulShutdown(shutdownCallback);
    });
  }

  private gracefulShutdown(shutdownCallback: () => Promise<void>): void {
    if (this.isShuttingDown) {
      logger.warn("Shutdown already in progress, forcing exit...");
      process.exit(0);
      return;
    }

    this.isShuttingDown = true;
    shutdownCallback()
      .then(() => {
        logger.info("Graceful shutdown complete");
        process.exit(0);
      })
      .catch((err) => {
        logger.error("Error during graceful shutdown", { error: err });
        process.exit(1);
      });
  }
}
