import { Request, Response } from "express";

import { AnalysedRepoService } from "../services/analysedRepo/analysedRepo.service";
import { GithubService } from "../services/github/github.service";
import { UserService } from "../services/user/user.service";

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
    res.status(202).json({
      status: "success",
      message: "analyze job posting",
    });

    try {
      const githubClient = new GithubService(username.login, name, userId, token.access_token as string);

      const result = await githubClient.ingestRepo();

      const res = await this.analysedRepoService.create(userId, result.analyzedRepo, result.participants);

      console.log("[AnalyzeController]: RES → analysedRepoService: ", res);
    } catch (err) {
      console.log("🚨 AnalyzeController: ", err);
    }
  }
}
