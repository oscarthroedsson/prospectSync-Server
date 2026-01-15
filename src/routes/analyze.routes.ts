import { Router } from "express";
import { AnalyzeController } from "../controllers/analyze.controller";

const router = Router();
const analyzeController = new AnalyzeController();

router.post("/repository", (req, res) => analyzeController.analyzeGithubRepo(req, res));

export default router;
