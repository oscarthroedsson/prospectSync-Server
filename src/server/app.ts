import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import "express-async-errors";
import { requestTimeout, timeoutHandler } from "../middleware/timeout.middleware";
import { env } from "../config/env";

export function createApp(): Express {
  const app = express();

  // Trust proxy if running behind reverse proxy (nginx, Cloudflare, etc.)
  // Only enable this if you're actually behind a proxy
  if (env.TRUST_PROXY === "true") {
    app.set("trust proxy", 1);
    console.log("✅ [App] Trust proxy enabled");
  }

  // Security
  app.use(helmet());

  // CORS - configurable origin via environment variable
  const corsOrigins = env.CLIENT_URL.split(",").map((origin) => origin.trim());
  app.use(
    cors({
      origin: corsOrigins,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
      allowedHeaders: ["Accept", "Authorization", "Content-Type", "X-USER-ID"],
      credentials: true,
    }),
  );
  console.log("✅ [App] CORS configured with origins:", corsOrigins);

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
