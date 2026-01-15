import { getJobPostingRepository } from "../../repositories/job-posting.repository";
import { cacheService } from "../cache/cache.service";
import { IJobPosting } from "../../models/job-posting.model";

export class JobPostingService {
  private jobPostingRepo = getJobPostingRepository();
  private cache = cacheService.jobPosting;

  async create(data: IJobPosting): Promise<IJobPosting> {
    const jobPosting = await this.jobPostingRepo.create(data);

    // Cache the newly created job posting
    await this.cache.set(jobPosting.jobPostingUrl, jobPosting);

    return jobPosting;
  }

  async getById(id: string): Promise<IJobPosting | null> {
    if (!id) throw new Error("ID is required");

    return this.jobPostingRepo.show(id);
  }

  async getByUrl(url: string): Promise<IJobPosting | null> {
    if (!url) throw new Error("URL is required");

    // Check cache first
    const cached = await this.cache.get(url);
    if (cached) return cached;

    // Fetch from database
    const jobPosting = await this.jobPostingRepo.showByUrl(url);

    // Cache if found
    if (jobPosting) await this.cache.set(url, jobPosting);

    return jobPosting;
  }

  async ensure(data: IJobPosting): Promise<IJobPosting | null> {
    const jobPosting = await this.jobPostingRepo.ensure(data);
    // Update cache
    if (jobPosting) this.cache.set(jobPosting.jobPostingUrl, jobPosting);

    return jobPosting;
  }

  async upsert(data: IJobPosting): Promise<IJobPosting> {
    const jobPosting = await this.jobPostingRepo.upsert(data);

    // Update cache
    await this.cache.set(jobPosting.jobPostingUrl, jobPosting);

    return jobPosting;
  }

  async update(id: string, data: Partial<IJobPosting>): Promise<IJobPosting> {
    if (!id) throw new Error("ID is required");

    const jobPosting = await this.jobPostingRepo.update(id, data);

    // Invalidate cache
    this.cache.delete(jobPosting.jobPostingUrl);

    return jobPosting;
  }

  async delete(url: string): Promise<void> {
    if (!url) throw new Error("URL is required");

    const existing = await this.jobPostingRepo.showByUrl(url);
    if (!existing || !existing.id) throw new Error("Job posting not found");

    // Delete using repository
    await this.jobPostingRepo.remove(existing.id);

    // Invalidate cache
    this.cache.delete(url);
  }

  async updateWorkArrangement(jobPostingId: string, workMode: string): Promise<void> {
    if (!jobPostingId) throw new Error("Job posting ID is required");
    if (!workMode) throw new Error("Work mode is required");

    await this.jobPostingRepo.updateWorkArrengment(jobPostingId, workMode);

    // Invalidate cache for this job posting
    const jobPosting = await this.jobPostingRepo.show(jobPostingId);
    if (jobPosting) {
      this.cache.delete(jobPosting.jobPostingUrl);
    }
  }

  async expiringSoon(daysUntilExpiration: number): Promise<IJobPosting[]> {
    if (daysUntilExpiration < 0) throw new Error("Days must be positive");

    return this.jobPostingRepo.findExpiringSoon(daysUntilExpiration);
  }

  async findExpired(): Promise<IJobPosting[]> {
    return this.jobPostingRepo.findExpired();
  }
}

let instance: JobPostingService | null = null;

export function getJobPostingService(): JobPostingService {
  if (!instance) instance = new JobPostingService();
  return instance;
}
