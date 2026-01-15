"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobPostingController = void 0;
const job_posting_repository_1 = require("../repositories/job-posting.repository");
const database_1 = require("../config/database");
class JobPostingController {
    async create(req, res) {
        try {
            const jobPostingData = req.body;
            const jobPostingRepo = (0, job_posting_repository_1.getJobPostingRepository)();
            // Check if job posting already exists by URL
            if (jobPostingData.jobPostingUrl) {
                const existing = await jobPostingRepo.showJobPosting(jobPostingData.jobPostingUrl);
                if (existing) {
                    res.status(409).json({
                        error: "Job posting already exists",
                        jobPosting: existing,
                    });
                    return;
                }
            }
            // TODO: Implement actual job posting creation
            // This requires:
            // - Validating the job posting data
            // - Creating the main job posting record
            // - Creating related records (languages, requirements, merits, etc.)
            // - Handling all nested data structures
            res.status(501).json({
                message: "Create job posting not fully implemented",
                note: "This endpoint requires complex nested data creation. Use the scan endpoint to create job postings from URLs.",
            });
        }
        catch (error) {
            console.error("❌ [JobPostingController] Create error:", error);
            res.status(500).json({ error: error.message || "Failed to create job posting" });
        }
    }
    async show(req, res) {
        try {
            const url = req.query.url;
            if (!url) {
                res.status(400).json({ error: "url query parameter is required" });
                return;
            }
            const jobPostingRepo = (0, job_posting_repository_1.getJobPostingRepository)();
            const jobPosting = await jobPostingRepo.showJobPosting(url);
            if (!jobPosting) {
                res.status(404).json({ error: "Job posting not found" });
                return;
            }
            res.json(jobPosting);
        }
        catch (error) {
            console.error("❌ [JobPostingController] Show error:", error);
            res.status(500).json({ error: error.message || "Failed to retrieve job posting" });
        }
    }
    async update(req, res) {
        try {
            const url = req.query.url;
            // const updateData = req.body; // Will be used when implementing update
            if (!url) {
                res.status(400).json({ error: "url query parameter is required" });
                return;
            }
            const jobPostingRepo = (0, job_posting_repository_1.getJobPostingRepository)();
            const existing = await jobPostingRepo.showJobPosting(url);
            if (!existing || !existing.id) {
                res.status(404).json({ error: "Job posting not found" });
                return;
            }
            // TODO: Implement actual job posting update
            // This requires:
            // - Updating the main job posting record using updateData
            // - Handling updates to related records (languages, requirements, etc.)
            // - Managing deletions and additions of nested data
            res.status(501).json({
                message: "Update job posting not fully implemented",
                note: "This endpoint requires complex nested data updates.",
            });
        }
        catch (error) {
            console.error("❌ [JobPostingController] Update error:", error);
            res.status(500).json({ error: error.message || "Failed to update job posting" });
        }
    }
    async delete(req, res) {
        try {
            const url = req.query.url;
            if (!url) {
                res.status(400).json({ error: "url query parameter is required" });
                return;
            }
            const jobPostingRepo = (0, job_posting_repository_1.getJobPostingRepository)();
            const existing = await jobPostingRepo.showJobPosting(url);
            if (!existing || !existing.id) {
                res.status(404).json({ error: "Job posting not found" });
                return;
            }
            // Delete job posting (cascade will handle related records)
            const prisma = (0, database_1.getPrismaClient)();
            await prisma.jobPosting.delete({
                where: { id: existing.id },
            });
            res.json({ message: "Job posting deleted successfully" });
        }
        catch (error) {
            console.error("❌ [JobPostingController] Delete error:", error);
            res.status(500).json({ error: error.message || "Failed to delete job posting" });
        }
    }
}
exports.JobPostingController = JobPostingController;
//# sourceMappingURL=job-posting.controller.js.map