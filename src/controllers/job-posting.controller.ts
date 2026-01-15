import { Request, Response } from "express";
import { getJobPostingService } from "../services/job-posting/job-posting.service";

export class JobPostingController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const jobPostingData = req.body;
      const jobPostingService = getJobPostingService();

      // Check if job posting already exists by URL
      if (jobPostingData.jobPostingUrl) {
        const existing = await jobPostingService.getByUrl(jobPostingData.jobPostingUrl);
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
    } catch (error: any) {
      console.error("❌ [JobPostingController] Create error:", error);
      res.status(500).json({ error: error.message || "Failed to create job posting" });
    }
  }

  async show(req: Request, res: Response): Promise<void> {
    try {
      const url = req.query.url as string;

      if (!url) {
        res.status(400).json({ error: "url query parameter is required" });
        return;
      }

      const jobPostingService = getJobPostingService();
      const jobPosting = await jobPostingService.getByUrl(url);

      if (!jobPosting) {
        res.status(404).json({ error: "Job posting not found" });
        return;
      }

      res.json(jobPosting);
    } catch (error: any) {
      console.error("❌ [JobPostingController] Show error:", error);
      res.status(500).json({ error: error.message || "Failed to retrieve job posting" });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const url = req.query.url as string;
      // const updateData = req.body; // Will be used when implementing update

      if (!url) {
        res.status(400).json({ error: "url query parameter is required" });
        return;
      }

      const jobPostingService = getJobPostingService();
      const existing = await jobPostingService.getByUrl(url);

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
    } catch (error: any) {
      console.error("❌ [JobPostingController] Update error:", error);
      res.status(500).json({ error: error.message || "Failed to update job posting" });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const url = req.query.url as string;

      if (!url) {
        res.status(400).json({ error: "url query parameter is required" });
        return;
      }

      const jobPostingService = getJobPostingService();
      await jobPostingService.delete(url);

      res.json({ message: "Job posting deleted successfully" });
    } catch (error: any) {
      console.error("❌ [JobPostingController] Delete error:", error);
      res.status(500).json({ error: error.message || "Failed to delete job posting" });
    }
  }
}
