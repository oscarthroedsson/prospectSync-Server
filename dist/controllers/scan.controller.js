"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScanController = void 0;
const pdf_parser_1 = require("../utils/pdf/pdf-parser");
const web_scraper_1 = require("../utils/web/web-scraper");
const ai_client_1 = require("../ai/ai-client");
const job_posting_repository_1 = require("../repositories/job-posting.repository");
const webhook_service_1 = require("../services/webhook/webhook.service");
const webhook_model_1 = require("../models/webhook.model");
const job_posting_mapper_1 = require("../utils/mapper/job-posting.mapper");
class ScanController {
    async scanPDF(req, res) {
        try {
            const file = req.file;
            if (!file) {
                res.status(400).json({ error: "No file uploaded" });
                return;
            }
            // Extract text from PDF
            const rawText = await (0, pdf_parser_1.extractTextFromPDF)(file.buffer);
            console.log("📄 RAW TEXT:", rawText);
            // Load resume schema (for reference in prompt)
            // Schema is used by AI client internally
            // Generate resume using AI
            const aiClient = (0, ai_client_1.getAIClient)();
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
            const resumeData = await aiClient.generateResume(prompt);
            res.json(resumeData);
        }
        catch (error) {
            console.error("❌ [ScanController] PDF scan error:", error);
            res.status(500).json({ error: error.message || "Failed to scan PDF" });
        }
    }
    async scanJobPosting(req, res) {
        const url = req.query.url;
        const userID = req.headers["x-user-id"];
        try {
            const webhookService = (0, webhook_service_1.getWebhookService)();
            const hook = webhookService.initiate(webhook_model_1.WebhookEvent.SCAN, webhook_model_1.WebhookType.JOB_POSTING, userID || undefined);
            const createdById = userID || undefined;
            const repo = (0, job_posting_repository_1.getJobPostingRepository)();
            const existingJob = await repo.showJobPosting(url);
            if (existingJob) {
                console.log("🔵 Job posting already exists in DB, skipping scan and returning existing");
                await hook.success(existingJob, "Good news! We have already scanned this job posting");
                res.status(202).json({
                    status: "accepted",
                    message: "Good news! We have already scanned this job posting",
                    url,
                });
                return;
            }
            // Get HTML content
            const htmlContent = await (0, web_scraper_1.retrieveDOM)(url, 30);
            console.log("✅ HTTP GET successful");
            const cleanedText = (0, web_scraper_1.extractText)(htmlContent);
            console.log("🧹 CLEAN TEXT");
            console.log(cleanedText);
            // Load job posting schema (for reference in prompt)
            // Schema is used by AI client internally
            // Start webhook
            await hook.start();
            // Return accepted immediately
            res.status(202).json({
                status: "accepted",
                message: "Jobbscanning has started",
                url,
            });
            // Start AI operation in background
            (async () => {
                try {
                    console.log("🚗 INSIDE BACKGROUND TASK");
                    const aiClient = (0, ai_client_1.getAIClient)();
                    const prompt = `
            **ROLL:** <Roll>
              Du är en specialist på strukturerad datautvinning (Data Extraction Expert) med fokus på **Jobbannonser**.
            </Roll>

            <assignment>
              Analysera den utvunna råtexten från en jobbannons och extrahera **ALL** relevant data.
              Fokusera särskilt på att identifiera och strukturera fält som **Titel**, **Företag**, **Krav**, **Förmåner**, **Lön** och **Plats**.
            </assignment>

            <Rules>
            1. Du MÅSTE strikt anropa funktionen **"save_job_posting"** EXAKT en gång. (Använd det namn du definierat i Tools).
            2. Utdata MÅSTE vara en felfri JSON-sträng som validerar mot det givna schemat.
            3. Hallucination förbjuden: Du FÅR INTE lägga till information som inte uttryckligen finns i källtexten. Om ett fält saknas, fyll i det med **null**, en tom sträng (**""**), eller en tom array (**[]**) enligt schemat.
            4. Datum & Tid: Följ det strikta formatet **ISO 8601** (t.ex. YYYY-MM-DDTHH:MM:SSZ) för fälten **endsAt, createdAt** och **updatedAt**. Om tid saknas, använd **T00:00:00Z**.
            5. Markdown: Använd texten för att generera en strukturerad och välformulerad text i Markdown-format för fältet **markdownText**.
            6. JobDescription: Sammanfatta en kort [300 karaktärer MAX] sammanfattning av arbetsrollen som sinch söker.
            7. Alla egenskaper och kunskaper som efterfrågas av jobb sökaren ska läggas under applicantQualities. Personliga egenskaper och kod relaterade kunskaper. Två ordade egenskaper ska ha _ istället för mellanslag
            8. Du ska använda samma språk som det görs i texten inom <CONTENT>
            9. Följ ALLA regler i det medföljande JSON-schemat (i Tools).
            </Rules>
            
            --- RÅTEXT FRÅN JOBBANNONS ATT ANALYSERA ---
            <Content>
            ${cleanedText}
            </Content>
          `;
                    const jobPostingData = await aiClient.generateJobPosting(prompt);
                    const jobPosting = (0, job_posting_mapper_1.jobPostingMapper)(jobPostingData, url, createdById);
                    await hook.success(jobPosting);
                }
                catch (error) {
                    console.error("🌺 [ScanController] AI CHAT ERROR:", error);
                    await hook.error("Scanning job posting failed");
                }
            })();
        }
        catch (error) {
            console.error("❌ [ScanController] Job posting scan error:", error);
            res.status(400).json({ error: error.message || "Error getting url content" });
        }
    }
    async scanRepo(_req, res) {
        res.json({ message: "repo scan" });
    }
}
exports.ScanController = ScanController;
//# sourceMappingURL=scan.controller.js.map