import { Router, Request, Response } from "express";
import { ScanController } from "../controllers/scan.controller";
import { upload } from "../middleware/file-upload.middleware";
import { userScanRateLimiter, scanRateLimiter } from "../middleware/rate-limit.middleware";
import { scanJobPostingValidation } from "../middleware/validation.middleware";
import { scanTimeout } from "../middleware/timeout.middleware";

const router = Router();
const scanController = new ScanController();

// Apply scan timeout (60s) to all scan routes
// Note: scanTimeout already handles timeout, no need for separate timeoutHandler
router.use(scanTimeout);

// Apply both user-based and IP-based rate limiters (only one will apply based on x-user-id header)
router.post("/document", upload.single("file"), userScanRateLimiter, scanRateLimiter, (req: Request, res: Response) =>
  scanController.scanPDF(req, res)
);

router.post("/job-posting", scanJobPostingValidation, userScanRateLimiter, scanRateLimiter, (req: Request, res: Response) =>
  scanController.scanJobPosting(req, res)
);

router.post("/repo", (req: Request, res: Response) => scanController.scanRepo(req, res));

export default router;
