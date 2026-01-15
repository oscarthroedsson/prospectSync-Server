import { Express } from "express";
import { Server } from "http";
import { env } from "../config";

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
        console.log(`🚀 [Server] HTTP server started on port ${port}`);
        resolve();
      });

      this.server.on("error", (error: Error) => {
        console.error("❌ [Server] Server error:", error);
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

      this.server.close((err) => {
        if (err) {
          console.error("❌ [Server] Error closing server:", err);
          reject(err);
        } else {
          console.log("✅ [Server] Server closed");
          resolve();
        }
      });
    });
  }
}
