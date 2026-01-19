import { Express } from "express";
import scanRoutes from "../routes/scan.routes";
import analyzeRoutes from "../routes/analyze.routes";
import jobPostingRoutes from "../routes/job-posting.routes";

export function registerRoutes(app: Express): void {
  /*
  ? Add global middlewares here? rate-limit 
  ƒ Auth should be added to specific routes 
  */

  app.use("/api/scan", scanRoutes);
  app.use("/api/analyse", analyzeRoutes);
  app.use("/api/job-posting", jobPostingRoutes);
}
