"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const scan_controller_1 = require("../controllers/scan.controller");
const file_upload_middleware_1 = require("../middleware/file-upload.middleware");
const rate_limit_middleware_1 = require("../middleware/rate-limit.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const router = (0, express_1.Router)();
const scanController = new scan_controller_1.ScanController();
router.post("/document", file_upload_middleware_1.upload.single("file"), rate_limit_middleware_1.scanRateLimiter, (req, res) => scanController.scanPDF(req, res));
router.post("/job-posting", validation_middleware_1.scanJobPostingValidation, rate_limit_middleware_1.scanRateLimiter, (req, res) => scanController.scanJobPosting(req, res));
router.post("/repo", (req, res) => scanController.scanRepo(req, res));
exports.default = router;
//# sourceMappingURL=scan.routes.js.map