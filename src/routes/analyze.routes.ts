import { Router } from "express";
import { AnalyzeController } from "../controllers/analyze.controller";

const router = Router();
const analyzeController = new AnalyzeController();
/**
 * All ingoing req should go threw a queue checker
 * if active > 5 wait untill open slot
 */
router.post("/repository", (req, res) => analyzeController.analyzeGithubRepo(req, res));

export default router;
