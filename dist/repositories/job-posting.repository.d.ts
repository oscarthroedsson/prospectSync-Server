import { JobPosting } from "../models/job-posting.model";
export declare class JobPostingRepository {
    private prisma;
    constructor();
    findExpiringSoon(daysUntilExpiration: number): Promise<JobPosting[]>;
    findExpired(): Promise<JobPosting[]>;
    showJobPosting(url: string): Promise<JobPosting | null>;
    private mapToJobPostings;
    private mapToJobPosting;
}
export declare function getJobPostingRepository(): JobPostingRepository;
//# sourceMappingURL=job-posting.repository.d.ts.map