import { ScanController } from "../../../src/controllers/scan.controller";
import { Request, Response } from "express";
import { extractTextFromPDF } from "../../../src/utils/pdf/pdf-parser";
import { retrieveDOM, extractText } from "../../../src/utils/web/web-scraper";
import { getAIClient } from "../../../src/ai/ai-client";
import { getJobPostingRepository } from "../../../src/repositories/job-posting.repository";
import { getWebhookService } from "../../../src/services/webhook/webhook.service";
import { sampleJobPosting, samplePDFBuffer, sampleResumeData } from "../../helpers/fixtures";

jest.mock("../../../src/utils/pdf/pdf-parser");
jest.mock("../../../src/utils/web/web-scraper");
jest.mock("../../../src/ai/ai-client");
jest.mock("../../../src/repositories/job-posting.repository");
jest.mock("../../../src/services/webhook/webhook.service");

describe("ScanController", () => {
  let controller: ScanController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    controller = new ScanController();
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe("scanPDF", () => {
    it("should scan PDF and return resume data", async () => {
      mockReq = {
        file: {
          buffer: samplePDFBuffer,
          mimetype: "application/pdf",
        } as Express.Multer.File,
      };

      (extractTextFromPDF as jest.Mock).mockResolvedValue("PDF text content");
      (getAIClient as jest.Mock).mockReturnValue({
        generateResume: jest.fn().mockResolvedValue(sampleResumeData),
      });

      await controller.scanPDF(mockReq as Request, mockRes as Response);

      expect(extractTextFromPDF).toHaveBeenCalledWith(samplePDFBuffer);
      expect(mockRes.json).toHaveBeenCalledWith(sampleResumeData);
    });

    it("should return 400 when no file uploaded", async () => {
      mockReq = { file: undefined };

      await controller.scanPDF(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "No file uploaded" });
    });
  });

  describe("scanJobPosting", () => {
    it("should return existing job if found", async () => {
      mockReq = {
        query: { url: "https://example.com/job" },
        headers: { "x-user-id": "user-123" },
      };

      const mockWebhookSession = {
        start: jest.fn().mockResolvedValue(undefined),
        success: jest.fn().mockResolvedValue(undefined),
      };

      (getJobPostingRepository as jest.Mock).mockReturnValue({
        showJobPosting: jest.fn().mockResolvedValue(sampleJobPosting),
      });
      (getWebhookService as jest.Mock).mockReturnValue({
        initiate: jest.fn().mockReturnValue(mockWebhookSession),
      });

      await controller.scanJobPosting(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(202);
      expect(mockWebhookSession.success).toHaveBeenCalled();
    });

    it("should start scanning new job posting", async () => {
      mockReq = {
        query: { url: "https://example.com/new-job" },
        headers: {},
      };

      const mockWebhookSession = {
        start: jest.fn().mockResolvedValue(undefined),
        success: jest.fn().mockResolvedValue(undefined),
        error: jest.fn().mockResolvedValue(undefined),
      };

      (getJobPostingRepository as jest.Mock).mockReturnValue({
        showJobPosting: jest.fn().mockResolvedValue(null),
      });
      (getWebhookService as jest.Mock).mockReturnValue({
        initiate: jest.fn().mockReturnValue(mockWebhookSession),
      });
      (retrieveDOM as jest.Mock).mockResolvedValue("<html>...</html>");
      (extractText as jest.Mock).mockReturnValue("Cleaned text");
      (getAIClient as jest.Mock).mockReturnValue({
        generateJobPosting: jest.fn().mockResolvedValue({ title: "Job" }),
      });

      await controller.scanJobPosting(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(202);
      expect(mockWebhookSession.start).toHaveBeenCalled();
    });
  });
});
