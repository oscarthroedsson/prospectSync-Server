import { JobPostingMapper } from "../../../../src/utils/mapper/job-posting.mapper";

describe("Job Posting Mapper", () => {
  it("should map data to JobPosting with required fields", () => {
    const data = {
      title: "Senior Engineer",
      companyName: "Test Company",
      markdownText: "# Job Description",
      status: "active",
      preferenceSet: {
        languages: [],
        requirements: [],
        merits: [],
        applicantQualities: [],
      },
    };

    const url = "https://example.com/job/123";
    const createdById = "user-123";

    const result = JobPostingMapper.create(data, url, createdById);

    expect(result.jobPostingUrl).toBe(url);
    expect(result.createdJobPosting?.createdByType).toBe("system");
    expect(result.createdJobPosting?.createdById).toBe(createdById);
    expect(result.createdJobPosting?.source).toBe("url");
    expect(result.createdAt).toBeDefined();
    expect(result.updatedAt).toBeDefined();
  });

  it("should handle missing createdById", () => {
    const data = {
      title: "Job",
      companyName: "Company",
      markdownText: "Description",
      status: "active",
      preferenceSet: {
        languages: [],
        requirements: [],
        merits: [],
        applicantQualities: [],
      },
    };

    const result = JobPostingMapper.create(data, "https://example.com/job", undefined);

    expect(result.createdJobPosting?.createdById).toBeUndefined();
  });

  it("should preserve all data fields", () => {
    const data = {
      title: "Senior Engineer",
      companyName: "Test Company",
      companyLogo: "https://example.com/logo.png",
      jobDescription: "We are hiring",
      markdownText: "# Job Description",
      status: "active",
      endsAt: "2024-12-31T23:59:59Z",
      preferenceSet: {
        languages: [{ language: "English", level: "Fluent" }],
        requirements: [{ requirement: "5+ years" }],
        merits: [{ merit: "Remote" }],
        applicantQualities: [{ quality: "Team player" }],
        locations: [{ city: "Stockholm", country: "Sweden" }],
        workArrangements: [{ mode: "remote" }],
        employmentTypes: [{ type: "full_time" }],
        salaries: [
          {
            minAmount: 50000,
            maxAmount: 60000,
            currency: "SEK",
            period: "monthly",
          },
        ],
      },
    };

    const result = JobPostingMapper.create(data, "https://example.com/job", "user-123");

    expect(result.title).toBe(data.title);
    expect(result.companyName).toBe(data.companyName);
    expect(result.companyLogo).toBe(data.companyLogo);
    expect(result.jobDescription).toBe(data.jobDescription);
    expect(result.preferenceSet?.languages).toEqual(data.preferenceSet.languages);
    expect(result.preferenceSet?.requirements).toEqual(data.preferenceSet.requirements);
  });
});
