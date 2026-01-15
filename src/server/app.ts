import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import "express-async-errors";
import { requestTimeout, timeoutHandler } from "../middleware/timeout.middleware";
import "../config/env";

export function createApp(): Express {
  const app = express();

  // Security
  app.use(helmet());

  // CORS - match Go version config
  app.use(
    cors({
      origin: "http://localhost:3000",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
      allowedHeaders: ["Accept", "Authorization", "Content-Type", "X-USER-ID"],
      credentials: true,
    })
  );

  // Body parsing with size limits
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Request timeout (applied to all routes except health check)
  app.use(requestTimeout);
  app.use(timeoutHandler);

  // Health check (no timeout)
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  return app;
}
