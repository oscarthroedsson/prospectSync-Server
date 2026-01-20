import { Request, Response } from "express";

import { GithubService } from "../services/github/github.service";
import { UserService } from "../services/user/user.service";

export class AnalyzeController {
  async analyzeGithubRepo(_req: Request, res: Response): Promise<void> {
    const userService = new UserService();

    const userId = _req.headers["x-user-id"] as string | undefined;
    const owner = _req.body.owner;
    const name = _req.body.name;
    const repoUrl = _req.body.defaultBranch;

    if (!userId || !owner || !name || !repoUrl) {
      res.status(501).json({
        status: "error",
        message: "Missing data",
      });
      return;
    }

    const user = await userService.showById(userId);

    console.log("🪄🐇: ", {
      userId,
      owner,
      name,
      repoUrl,
    });
    const token = user?.providers?.find((item) => item.provider === "github")?.token ?? "";

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
      const githubClient = new GithubService(owner.login, name, userId, token.access_token as string);

      await githubClient.ingestRepo();
    } catch (err) {
      console.log("🚨 AnalyzeController: ", err);
    }
  }
}
