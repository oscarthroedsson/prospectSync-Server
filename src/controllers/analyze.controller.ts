import { Request, Response } from "express";

export class AnalyzeController {
  async analyzeGithubRepo(_req: Request, res: Response): Promise<void> {
    res.json({ message: "analyze job posting" });
  }
}
