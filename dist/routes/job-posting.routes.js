"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const job_posting_controller_1 = require("../controllers/job-posting.controller");
const router = (0, express_1.Router)();
const jobPostingController = new job_posting_controller_1.JobPostingController();
router.post("/create", (req, res) => jobPostingController.create(req, res));
router.get("/show", (req, res) => jobPostingController.show(req, res));
router.patch("/update", (req, res) => jobPostingController.update(req, res));
router.delete("/delete", (req, res) => jobPostingController.delete(req, res));
exports.default = router;
//# sourceMappingURL=job-posting.routes.js.map