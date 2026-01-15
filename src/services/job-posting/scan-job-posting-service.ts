import { JobPostingSchema } from "../../schemas/jobPostingSchema";

import { zodResponseFormat } from "openai/helpers/zod";
import { WebScraperService } from "../web-scrape/web-scraper.service";
import { openAI } from "../../config/openAI";

export class ScanJobPostingService {
  private abortController: AbortController | null = null;

  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  async start(waitMs: number = 120_000) {
    this.abortController = new AbortController();
    setTimeout(() => this.abortController?.abort(), waitMs); // 2 min

    const scraper = new WebScraperService();
    const content = await scraper.scrape(this.url, {
      format: "text",
    });

    const completion = await openAI.chat.completions.parse({
      model: "gpt-5-mini",
      messages: [
        {
          role: "system",
          content: `
        You are a Data Extraction Expert specializing in job postings.
        
        Your task is to analyze raw text from a job posting and extract ALL relevant data into a structured format.
        Focus on identifying: Title, Company, Requirements, Benefits, Salary, and Location.
        
        CRITICAL RULES:
        1. NO HALLUCINATION: Only extract information explicitly present in the source text
        2. Missing data: Use null for missing fields, empty string ("") for text, or empty array ([]) as appropriate
        3. Date format: Use ISO 8601 (YYYY-MM-DDTHH:MM:SSZ) for endsAt, createdAt, and updatedAt. If time is missing, use T00:00:00Z
        4. markdownText: Generate well-structured Markdown from the posting content
        5. jobDescription: Create a brief summary (MAX 300 characters) of the role
        6. applicantQualities: List ALL required skills and personal qualities. Use underscore (_) instead of spaces in two-word qualities (e.g., "problem_solving")
        7. Language: Use the SAME language as the source content an specified on the job post. 
        8. Strictly follow the provided JSON schema
      `,
        },
        {
          role: "user",
          content: `
            --- RÅTEXT FRÅN JOBBANNONS ATT ANALYSERA ---
            <Content>
            ${content}
            </Content>
          `,
        },
      ],
      response_format: zodResponseFormat(JobPostingSchema, "job_posting"),
    });
    console.log("✅ OpenAI API response received");
    console.log("📊 Full completion object:", JSON.stringify(completion, null, 2));
    console.log("🎯 Parsed result:", JSON.stringify(completion.choices[0].message.parsed, null, 2));
    console.log("⚠️ Refusal (if any):", completion.choices[0].message.refusal);

    return completion.choices[0].message.parsed;
  }

  // kill the process when ever needed
  stop() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
      console.log("AI request aborted!");
    }
  }
}
