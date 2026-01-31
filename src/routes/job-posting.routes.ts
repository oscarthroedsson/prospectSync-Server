import { Router } from "express";
import { JobPostingController } from "../controllers/job-posting.controller";
import { requireAuth } from "../middleware/auth.middleware";
import {
  validateCreateJobPosting,
  validateUpdateJobPosting,
  validateJobPostingUrl,
} from "../schemas/validation/job-posting.schema";

const router = Router();
const jobPostingController = new JobPostingController();

// All job posting routes require authentication
router.use(requireAuth);

router.post("/create", validateCreateJobPosting, (req, res) => jobPostingController.create(req, res));
router.get("/show", validateJobPostingUrl, (req, res) => jobPostingController.show(req, res));
router.patch("/update", validateUpdateJobPosting, (req, res) => jobPostingController.update(req, res));
router.delete("/delete", validateJobPostingUrl, (req, res) => jobPostingController.delete(req, res));

export default router;
