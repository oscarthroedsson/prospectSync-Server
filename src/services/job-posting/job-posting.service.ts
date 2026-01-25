import { getJobPostingRepository } from "../../repositories/job-posting.repository";
import { IJobPostingDTO, IJobPostingCreateDTO, IJobPostingUpdateDTO } from "../../Types/job-postingt.types";
import { cacheService } from "../cache/cache.service";
import { JobPostingMapper } from "../../utils/mapper/job-posting.mapper";

export class JobPostingService {
  private jobPostingRepo = getJobPostingRepository();
  private cache = cacheService.jobPosting;

  async create(data: IJobPostingCreateDTO): Promise<IJobPostingDTO> {
    const prismaResult = await this.jobPostingRepo.create(data);
    const jobPosting = JobPostingMapper.db(prismaResult);

    // Cache the newly created job posting
    await this.cache.set(jobPosting.jobPostingUrl, jobPosting);

    return jobPosting;
  }

  async showById(id: string): Promise<IJobPostingDTO | null> {
    if (!id) throw new Error("ID is required");

    const prismaResult = await this.jobPostingRepo.show(id);
    return prismaResult ? JobPostingMapper.db(prismaResult) : null;
  }

  async showByUrl(url: string): Promise<IJobPostingDTO | null> {
    if (!url) throw new Error("URL is required");

    // Check cache first
    const cached = await this.cache.get(url);
    if (cached) return cached;

    // Fetch from database
    const prismaResult = await this.jobPostingRepo.showByUrl(url);
    const jobPosting = prismaResult ? JobPostingMapper.db(prismaResult) : null;

    // Cache if found
    if (jobPosting) await this.cache.set(url, jobPosting);

    return jobPosting;
  }

  async getByUrl(url: string): Promise<IJobPostingDTO | null> {
    return this.showByUrl(url);
  }

  async ensure(data: IJobPostingCreateDTO): Promise<IJobPostingDTO | null> {
    const prismaResult = await this.jobPostingRepo.ensure(data);
    const jobPosting = prismaResult ? JobPostingMapper.db(prismaResult) : null;

    // Update cache
    if (jobPosting) this.cache.set(jobPosting.jobPostingUrl, jobPosting);

    return jobPosting;
  }

  async upsert(data: IJobPostingCreateDTO): Promise<IJobPostingDTO> {
    const prismaResult = await this.jobPostingRepo.upsert(data);
    const jobPosting = JobPostingMapper.db(prismaResult);

    // Update cache
    await this.cache.set(jobPosting.jobPostingUrl, jobPosting);

    return jobPosting;
  }

  async update(id: string, data: IJobPostingUpdateDTO): Promise<IJobPostingDTO> {
    if (!id) throw new Error("ID is required");

    const prismaResult = await this.jobPostingRepo.update(id, data);
    const jobPosting = JobPostingMapper.db(prismaResult);

    // Invalidate cache
    this.cache.delete(jobPosting.jobPostingUrl);

    return jobPosting;
  }

  async delete(url: string): Promise<void> {
    if (!url) throw new Error("URL is required");

    const prismaResult = await this.jobPostingRepo.showByUrl(url);
    const existing = prismaResult ? JobPostingMapper.db(prismaResult) : null;
    
    if (!existing || !existing.id) throw new Error("Job posting not found");

    // Delete using repository
    await this.jobPostingRepo.remove(existing.id);

    // Invalidate cache
    this.cache.delete(url);
  }

  async expiringSoon(daysUntilExpiration: number): Promise<IJobPostingDTO[]> {
    if (daysUntilExpiration < 0) throw new Error("Days must be positive");

    const prismaResults = await this.jobPostingRepo.findExpiringSoon(daysUntilExpiration);
    return prismaResults.map(JobPostingMapper.db);
  }

  async findExpired(): Promise<IJobPostingDTO[]> {
    const prismaResults = await this.jobPostingRepo.findExpired();
    return prismaResults.map(JobPostingMapper.db);
  }
}

let instance: JobPostingService | null = null;

export function getJobPostingService(): JobPostingService {
  if (!instance) instance = new JobPostingService();
  return instance;
}
