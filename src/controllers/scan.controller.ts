import { Request, Response } from "express";
import { extractTextFromPDF } from "../utils/pdf/pdf-parser";
import { getJobPostingService } from "../services/job-posting/job-posting.service";
import { WebhookService } from "../services/webhook/webhook.service";
import { WebhookEvent, WebhookType } from "../models/webhook.model";
import { ScanJobPostingService } from "../services/job-posting/scan-job-posting-service";

import { jobPostingMapper } from "../utils/mapper/job-posting.mapper";

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
      const existingJob = await jobPostingService.getByUrl(url);

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
      res.status(202).json({
        status: "accepted",
        message: "Scanning started, you'll be notified via webhook when complete",
        url,
      });

      // 🔥 Fire n Forget
      hook.start("Starting scanning of the job posting");
      (async () => {
        try {
          console.info("🏁🔥 [scanJobPosting] Starting fire n forget");
          // AI operation can take long time, send error if it takes to long time

          console.log("⏱️ Starting job scan timer...");
          console.time("JobScanTimer");

          const scannedJobPosting = await scanner.start();
          const jobPosting = jobPostingMapper(scannedJobPosting, url, userID);

          console.timeEnd("JobScanTimer"); // loggar tid sedan start
          console.log("✅ Job scan completed!");

          hook.success(jobPosting, "You job posting was successfully scanned");

          // Upload it to the DB
          /*
        → HANDLE db from BE in the future
        const jobPostingService = new JobPostingService();
        const data = await jobPostingService.create(scannedJobPosting);
        */
        } catch (err) {
          console.error("❌ Background scan error:", err);
          await scanner.stop();
          throw err;
        }
      })().catch((error) => {
        console.error("[scan.controller] scanJobPosting: ", error);
        hook.error("Something went wrong with the scanning");
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
