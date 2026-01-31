import { Express } from "express";
import { Server } from "http";
import { env } from "../config";
import { logger } from "../config/logger";

export class HttpServer {
  private app: Express;
  private server: Server | null = null;

  constructor(app: Express) {
    this.app = app;
  }

  public start(): Promise<void> {
    return new Promise((resolve, reject) => {
      const port = parseInt(env.PORTCODE, 10) || 8080;
      
      this.server = this.app.listen(port, () => {
        logger.info(`HTTP server started on port ${port}`);
        resolve();
      });

      this.server.on("error", (error: Error) => {
        logger.error("Server error", { error: error.message });
        reject(error);
      });
    });
  }

  public async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.server) {
        resolve();
        return;
      }

      const shutdownTimeout = 30000; // 30 seconds
      const timeout = setTimeout(() => {
        logger.warn("Graceful shutdown timeout, forcing close");
        this.server?.closeAllConnections?.();
        resolve();
      }, shutdownTimeout);

      this.server.close((err) => {
        clearTimeout(timeout);
        if (err) {
          logger.error("Error closing server", { error: err.message });
          reject(err);
        } else {
          logger.info("Server closed successfully");
          resolve();
        }
      });

      // Close idle connections immediately
      this.server.closeIdleConnections?.();
    });
  }
}
