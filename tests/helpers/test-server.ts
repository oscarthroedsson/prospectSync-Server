// Test server helpers

import request from "supertest";
import { Express } from "express";
import { createApp } from "../../src/server/app";
import { registerRoutes } from "../../src/router";
import { errorMiddleware } from "../../src/middleware/error.middleware";

export function createTestApp(): Express {
  const app = createApp();
  registerRoutes(app);
  app.use(errorMiddleware);
  return app;
}

export function getTestAgent(app: Express) {
  return request(app);
}
