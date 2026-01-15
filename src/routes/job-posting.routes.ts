import { Router } from "express";
import { JobPostingController } from "../controllers/job-posting.controller";

const router = Router();
const jobPostingController = new JobPostingController();

router.post("/create", (req, res) => jobPostingController.create(req, res));
router.get("/show", (req, res) => jobPostingController.show(req, res));
router.patch("/update", (req, res) => jobPostingController.update(req, res));
router.delete("/delete", (req, res) => jobPostingController.delete(req, res));

export default router;
