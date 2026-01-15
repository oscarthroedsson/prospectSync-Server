import { JobPostingRepository } from "../../../src/repositories/job-posting.repository";
import { getPrismaClient } from "../../../src/config/database";
import { mockPrismaClient } from "../../helpers/mocks";

jest.mock("../../../src/config/database", () => ({
  getPrismaClient: jest.fn(),
}));

describe("JobPostingRepository", () => {
  let repository: JobPostingRepository;

  beforeEach(() => {
    (getPrismaClient as jest.Mock).mockReturnValue(mockPrismaClient);
    repository = new JobPostingRepository();
    jest.clearAllMocks();
  });

  describe("findExpiringSoon", () => {
    it("should find job postings expiring within specified days", async () => {
      const mockJobs = [
        {
          id: "job-1",
          title: "Job 1",
          companyName: "Company 1",
          endsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: "active",
        },
      ];

      mockPrismaClient.jobPosting.findMany.mockResolvedValue(mockJobs);
      mockPrismaClient.jobPosting.findUnique.mockResolvedValue({
        ...mockJobs[0],
        languages: [],
        requirements: [],
        merits: [],
        applicantQualities: [],
        location: null,
        salary: null,
        employmentType: null,
        workMode: null,
        createdJobPosting: null,
      });

      const result = await repository.findExpiringSoon(3);

      expect(mockPrismaClient.jobPosting.findMany).toHaveBeenCalledWith({
        where: {
          endsAt: {
            not: null,
            gte: expect.any(String),
            lte: expect.any(String),
          },
          status: {
            not: "expired",
          },
        },
        orderBy: {
          endsAt: "asc",
        },
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should return empty array when no jobs found", async () => {
      mockPrismaClient.jobPosting.findMany.mockResolvedValue([]);

      const result = await repository.findExpiringSoon(3);

      expect(result).toEqual([]);
    });
  });

  describe("findExpired", () => {
    it("should find expired job postings", async () => {
      const mockJobs = [
        {
          id: "job-1",
          title: "Job 1",
          companyName: "Company 1",
          endsAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          status: "active",
        },
      ];

      mockPrismaClient.jobPosting.findMany.mockResolvedValue(mockJobs);
      mockPrismaClient.jobPosting.findUnique.mockResolvedValue({
        ...mockJobs[0],
        languages: [],
        requirements: [],
        merits: [],
        applicantQualities: [],
        location: null,
        salary: null,
        employmentType: null,
        workMode: null,
        createdJobPosting: null,
      });

      const result = await repository.findExpired();

      expect(mockPrismaClient.jobPosting.findMany).toHaveBeenCalledWith({
        where: {
          endsAt: {
            not: null,
            lt: expect.any(String),
          },
          status: {
            not: "expired",
          },
        },
        orderBy: {
          endsAt: "desc",
        },
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("showByUrl", () => {
    it("should return job posting with all relations", async () => {
      const url = "https://example.com/job/123";
      const mockJob = {
        id: "job-1",
        jobPostingUrl: url,
        title: "Test Job",
        companyName: "Test Company",
        languages: [{ language: "English", level: "Fluent" }],
        requirements: [{ value: "5+ years" }],
        merits: [{ value: "Remote" }],
        applicantQualities: [{ value: "Team player" }],
        location: { city: "Stockholm", country: "Sweden" },
        salary: {
          type: "monthly",
          amount: "50000",
          currency: "SEK",
          period: "month",
          benefits: [],
          notes: null,
        },
        employmentType: { type: "full-time" },
        workMode: { mode: "remote" },
        createdJobPosting: {
          createdByType: "system",
          createdById: "user-123",
          source: "url",
          importedAt: "2024-01-01T00:00:00Z",
        },
      };

      mockPrismaClient.jobPosting.findUnique.mockResolvedValue(mockJob);

      const result = await repository.showByUrl(url);

      expect(mockPrismaClient.jobPosting.findUnique).toHaveBeenCalledWith({
        where: { jobPostingUrl: url },
        include: {
          languages: true,
          requirements: true,
          merits: true,
          applicantQualities: true,
          location: true,
          salary: true,
          employmentType: true,
          workMode: true,
          createdJobPosting: true,
        },
      });

      expect(result).toBeDefined();
      expect(result?.jobPostingUrl).toBe(url);
    });

    it("should return null when job posting not found", async () => {
      mockPrismaClient.jobPosting.findUnique.mockResolvedValue(null);

      const result = await repository.showByUrl("https://example.com/not-found");

      expect(result).toBeNull();
    });
  });
});
