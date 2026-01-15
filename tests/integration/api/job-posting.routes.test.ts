import request from "supertest";
import { createTestApp } from "../../helpers/test-server";
import { getJobPostingRepository } from "../../../src/repositories/job-posting.repository";
import { getPrismaClient } from "../../../src/config/database";
import { sampleJobPosting } from "../../helpers/fixtures";
import { mockPrismaClient } from "../../helpers/mocks";

jest.mock("../../../src/repositories/job-posting.repository");
jest.mock("../../../src/config/database");

describe("Job Posting Routes", () => {
  let app: ReturnType<typeof createTestApp>;

  beforeEach(() => {
    app = createTestApp();
    jest.clearAllMocks();
  });

  describe("GET /api/job-posting/show", () => {
    it("should return job posting when found", async () => {
      (getJobPostingRepository as jest.Mock).mockReturnValue({
        showJobPosting: jest.fn().mockResolvedValue(sampleJobPosting),
      });

      const response = await request(app)
        .get("/api/job-posting/show")
        .query({ url: "https://example.com/job" });

      expect(response.status).toBe(200);
      expect(response.body.jobPostingUrl).toBe(sampleJobPosting.jobPostingUrl);
    });

    it("should return 404 when not found", async () => {
      (getJobPostingRepository as jest.Mock).mockReturnValue({
        showJobPosting: jest.fn().mockResolvedValue(null),
      });

      const response = await request(app)
        .get("/api/job-posting/show")
        .query({ url: "https://example.com/not-found" });

      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /api/job-posting/delete", () => {
    it("should delete job posting", async () => {
      (getJobPostingRepository as jest.Mock).mockReturnValue({
        showJobPosting: jest.fn().mockResolvedValue(sampleJobPosting),
      });
      (getPrismaClient as jest.Mock).mockReturnValue(mockPrismaClient);
      mockPrismaClient.jobPosting.delete.mockResolvedValue({});

      const response = await request(app)
        .delete("/api/job-posting/delete")
        .query({ url: "https://example.com/job" });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain("deleted");
    });
  });
});
