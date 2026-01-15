import request from "supertest";
import { createTestApp } from "../../helpers/test-server";
import { getJobPostingRepository } from "../../../src/repositories/job-posting.repository";
import { getWebhookService } from "../../../src/services/webhook/webhook.service";
import { sampleJobPosting } from "../../helpers/fixtures";

jest.mock("../../../src/repositories/job-posting.repository");
jest.mock("../../../src/services/webhook/webhook.service");
jest.mock("../../../src/utils/web/web-scraper");
jest.mock("../../../src/ai/ai-client");

describe("Scan Routes", () => {
  let app: ReturnType<typeof createTestApp>;

  beforeEach(() => {
    app = createTestApp();
    jest.clearAllMocks();
  });

  describe("POST /api/scan/job-posting", () => {
    it("should return 202 when job posting already exists", async () => {
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

      const response = await request(app)
        .post("/api/scan/job-posting")
        .query({ url: "https://example.com/job" });

      expect(response.status).toBe(202);
      expect(response.body.status).toBe("accepted");
    });

    it("should return 400 when url is invalid", async () => {
      const response = await request(app)
        .post("/api/scan/job-posting")
        .query({ url: "not-a-url" });

      expect(response.status).toBe(400);
    });
  });
});
