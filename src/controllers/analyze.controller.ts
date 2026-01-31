import { Request, Response } from "express";
import { randomUUID } from "crypto";

import { AnalysedRepoService } from "../services/analysedRepo/analysedRepo.service";
import { GithubService } from "../services/github/github.service";
import { UserService } from "../services/user/user.service";
import { getBackgroundJobTracker } from "../utils/background-job-tracker";

export class AnalyzeController {
  private analysedRepoService: AnalysedRepoService;
  constructor() {
    this.analysedRepoService = new AnalysedRepoService();
  }
  async analyzeGithubRepo(_req: Request, res: Response): Promise<void> {
    const userService = new UserService();

    const userId = _req.headers["x-user-id"] as string | undefined;
    const username = _req.body.owner;
    const name = _req.body.name;
    const repoUrl = _req.body.defaultBranch;

    if (!userId || !username || !name || !repoUrl) {
      res.status(501).json({
        status: "error",
        message: "Missing data",
      });
      return;
    }

    const user = await userService.showById(userId);

    console.log("🪄🐇: ", {
      userId,
      username,
      name,
      repoUrl,
    });
    const token = user?.providers?.find((item: any) => item.provider === "github")?.token ?? "";

    if (!token) {
      res.status(404).json({
        status: "error",
        message: "Could not find a active token",
      });
      return;
    }
    const jobId = randomUUID();

    res.status(202).json({
      status: "success",
      message: "Repository analysis started",
      jobId,
    });

    // Track background work with BackgroundJobTracker
    const jobTracker = getBackgroundJobTracker();

    jobTracker
      .track(jobId, async (signal) => {
        try {
          console.info("🏁 [analyzeGithubRepo] Starting background job:", jobId);

          const githubClient = new GithubService(username.login, name, userId, token.access_token as string);

          // Check if aborted
          if (signal.aborted) throw new Error("Job aborted during shutdown");

          const result = await githubClient.ingestRepo();
          const res = await this.analysedRepoService.create(userId, result.analyzedRepo, result.participants);

          console.log("✅ [AnalyzeController]: Analysis complete →", res);
        } catch (err) {
          console.error("❌ [AnalyzeController] Background analysis failed:", err);
          throw err;
        }
      })
      .catch((error) => {
        console.error("[analyze.controller] Background job failed:", error);
      });
  }
}
