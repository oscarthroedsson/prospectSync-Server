import { Request, Response } from "express";
import { randomUUID } from "crypto";

import { ScanJobPostingService } from "../services/job-posting/scan-job-posting-service";
import { getJobPostingService } from "../services/job-posting/job-posting.service";
import { WebhookService } from "../services/webhook/webhook.service";
import { JobPostingMapper } from "../utils/mapper/job-posting.mapper";
import { extractTextFromPDF } from "../utils/pdf/pdf-parser";
import { WebhookEvent, WebhookType } from "../Types/webhook.types";
import { getBackgroundJobTracker } from "../utils/background-job-tracker";

export class ScanController {
  /**
   * Should we take in the req in our constructor and delegate what to and use our methods and send back the req?
   */

  async scanPDF(req: Request, res: Response): Promise<void> {
    try {
      //! We need to know what PDF We are scanning

      /**
       * We need to move everything to its own file
       * In this file we should only handle delegation and reciving results to send in response
       * todo Fix this when we are improving the profile creation from CV
       */

      const file = req.file;
      if (!file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      // Extract text from PDF
      const rawText = await extractTextFromPDF(file.buffer);
      console.log("📄 RAW TEXT:", rawText);

      // Load resume schema (for reference in prompt)
      // Schema is used by AI client internally

      // Generate resume using AI
      /*
        const prompt = `
        **ROLL:** <Roll>
          Du är en specialist på strukturerad datautvinning (Data Extraction Expert) med fokus på CV:n.
        </Roll>

        <assignment>
          Analysera den utvunna CV-texten och extrahera ALL relevant data.
        </assignment>

        <Rules>
        1. Du MÅSTE strikt anropa funktionen "save_resume" EXAKT en gång.
        2. Utdata MÅSTE vara en felfri JSON-sträng som validerar mot det givna schemat.
        3. Hallucination förbjuden: Du FÅR INTE lägga till information som inte uttryckligen finns i CV:t. Om ett fält saknas, fyll i det med null, en tom sträng (""), eller en tom array ([]) enligt schemat.
        4. Datum & Plats: Följ de strikta formatkraven (t.ex. YYYY-MM-DD och 'Country, Region, City') som anges i schemabeskrivningarna.
        5. Följ ALLA regler i det medföljande JSON-schemat (i Tools).
        </Rules>
        
        --- DOKUMENT ATT ANALYSERA ---
        
        """${rawText}"""
      `;
*/
    } catch (error: any) {
      console.error("❌ [ScanController] PDF scan error:", error);
      res.status(500).json({ error: error.message || "Failed to scan PDF" });
    }
  }

  async scanJobPosting(req: Request, res: Response): Promise<void> {
    const url = req.query.url as string;
    const userID = req.headers["x-user-id"] as string;
    const hook = new WebhookService().initiate(WebhookEvent.SCAN, WebhookType.JOB_POSTING, userID || undefined);

    console.log("🚦🚦🚦", "http://localhost:8080/api/scan/job-posting");

    try {
      const jobPostingService = getJobPostingService();
      const existingJob = await jobPostingService.showByUrl(url);

      if (existingJob) {
        console.log("🔵 Job posting already exists in DB, skipping scan and returning existing");
        await hook.success(existingJob, "Good news! We have already scanned this job posting before");
        res.status(202).json({
          status: "accepted",
          message: "Good news! We have already scanned this job posting",
          url,
        });
        return;
      }

      const scanner = new ScanJobPostingService(url);

      /*
      send res that we have started but the code below should run even if we send res
      */
      const jobId = randomUUID();

      res.status(202).json({
        status: "accepted",
        message: "Scanning started, you'll be notified via webhook when complete",
        url,
        jobId,
      });

      // Track background work with BackgroundJobTracker
      const jobTracker = getBackgroundJobTracker();
      
      jobTracker.track(jobId, async (signal) => {
        try {
          await hook.start("Starting scanning of the job posting");
          console.info("🏁🔥 [scanJobPosting] Starting background job:", jobId);

          console.log("⏱️ Starting job scan timer...");
          console.time("JobScanTimer");

          const scannedJobPosting = await scanner.start();
          
          // Check if aborted
          if (signal.aborted) {
            throw new Error("Job aborted during shutdown");
          }

          const jobPosting = JobPostingMapper.create(scannedJobPosting, url, userID);
          console.log("🎯 Parsed result:", JSON.stringify(jobPosting, null, 2));
          console.timeEnd("JobScanTimer");
          console.log("✅ Job scan completed!");

          await hook.success(jobPosting, "Your job posting was successfully scanned");

          // Upload it to the DB
          /*
          → HANDLE db from BE in the future
          const jobPostingService = new JobPostingService();
          const data = await jobPostingService.create(scannedJobPosting);
          */
        } catch (err) {
          console.error("❌ Background scan error:", err);
          await scanner.stop();
          await hook.error("Something went wrong with the scanning");
          throw err;
        }
      }).catch((error) => {
        console.error("[scan.controller] Background job failed:", error);
      });
    } catch (error: any) {
      console.error("❌ [ScanController] Job posting scan error:", error);
      res.status(400).json({ error: error.message || "Something went wrong when starting up the scanning" });
    }
  }

  async scanRepo(_req: Request, res: Response): Promise<void> {
    res.json({ message: "repo scan" });
  }
}
