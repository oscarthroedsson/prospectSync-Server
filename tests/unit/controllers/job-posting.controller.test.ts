import { JobPostingController } from "../../../src/controllers/job-posting.controller";
import { Request, Response } from "express";
import { getJobPostingRepository } from "../../../src/repositories/job-posting.repository";
import { getPrismaClient } from "../../../src/config/database";
import { sampleJobPosting } from "../../helpers/fixtures";
import { mockPrismaClient } from "../../helpers/mocks";

jest.mock("../../../src/repositories/job-posting.repository");
jest.mock("../../../src/config/database");

describe("JobPostingController", () => {
  let controller: JobPostingController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    controller = new JobPostingController();
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe("show", () => {
    it("should return job posting when found", async () => {
      mockReq = { query: { url: "https://example.com/job" } };

      (getJobPostingRepository as jest.Mock).mockReturnValue({
        showJobPosting: jest.fn().mockResolvedValue(sampleJobPosting),
      });

      await controller.show(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith(sampleJobPosting);
    });

    it("should return 404 when job posting not found", async () => {
      mockReq = { query: { url: "https://example.com/not-found" } };

      (getJobPostingRepository as jest.Mock).mockReturnValue({
        showJobPosting: jest.fn().mockResolvedValue(null),
      });

      await controller.show(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it("should return 400 when url is missing", async () => {
      mockReq = { query: {} };

      await controller.show(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe("delete", () => {
    it("should delete job posting", async () => {
      mockReq = { query: { url: "https://example.com/job" } };

      (getJobPostingRepository as jest.Mock).mockReturnValue({
        showJobPosting: jest.fn().mockResolvedValue(sampleJobPosting),
      });
      (getPrismaClient as jest.Mock).mockReturnValue(mockPrismaClient);
      mockPrismaClient.jobPosting.delete.mockResolvedValue({});

      await controller.delete(mockReq as Request, mockRes as Response);

      expect(mockPrismaClient.jobPosting.delete).toHaveBeenCalledWith({
        where: { id: sampleJobPosting.id },
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Job posting deleted successfully",
      });
    });
  });
});
