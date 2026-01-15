import { IJobPosting } from "../../models/job-posting.model";

export function jobPostingMapper(data: any, url: string, createdById?: string): IJobPosting {
  const today = new Date().toISOString();

  const jobPosting: IJobPosting = {
    ...data,
    jobPostingUrl: url,
    createdAt: today,
    updatedAt: today,
    createdJobPosting: {
      createdByType: "system",
      createdById: createdById,
      source: "url",
      importedAt: today,
    },
  };

  return jobPosting;
}
