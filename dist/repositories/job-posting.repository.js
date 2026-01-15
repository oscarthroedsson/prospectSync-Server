"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobPostingRepository = void 0;
exports.getJobPostingRepository = getJobPostingRepository;
const database_1 = require("../config/database");
class JobPostingRepository {
    prisma;
    constructor() {
        this.prisma = (0, database_1.getPrismaClient)();
    }
    async findExpiringSoon(daysUntilExpiration) {
        // Use Prisma query with date filtering
        const now = new Date();
        const futureDate = new Date(now.getTime() + daysUntilExpiration * 24 * 60 * 60 * 1000);
        const jobs = await this.prisma.jobPosting.findMany({
            where: {
                endsAt: {
                    not: null,
                    gte: now.toISOString(),
                    lte: futureDate.toISOString(),
                },
                status: {
                    not: "expired",
                },
            },
            orderBy: {
                endsAt: "asc",
            },
        });
        return this.mapToJobPostings(jobs);
    }
    async findExpired() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const jobs = await this.prisma.jobPosting.findMany({
            where: {
                endsAt: {
                    not: null,
                    lt: today.toISOString(),
                },
                status: {
                    not: "expired",
                },
            },
            orderBy: {
                endsAt: "desc",
            },
        });
        return this.mapToJobPostings(jobs);
    }
    async showJobPosting(url) {
        const job = await this.prisma.jobPosting.findUnique({
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
        if (!job) {
            return null;
        }
        return this.mapToJobPosting(job);
    }
    async mapToJobPostings(jobs) {
        const result = [];
        for (const job of jobs) {
            // Fetch full job with relations if not already included
            let fullJob = job;
            if (!job.languages) {
                fullJob = await this.prisma.jobPosting.findUnique({
                    where: { id: job.id },
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
            }
            if (fullJob) {
                result.push(this.mapToJobPosting(fullJob));
            }
        }
        return result;
    }
    mapToJobPosting(job) {
        return {
            id: job.id,
            title: job.title,
            companyName: job.companyName,
            companyLogo: job.companyLogo || undefined,
            jobPostingUrl: job.jobPostingUrl,
            jobDescription: job.jobDescription || undefined,
            markdownText: job.markdownText,
            language: (job.languages || []).map((l) => ({
                language: l.language,
                level: l.level,
            })),
            jobRequirements: (job.requirements || []).map((r) => r.value),
            merits: (job.merits || []).map((m) => m.value),
            applicantQualities: (job.applicantQualities || []).map((aq) => aq.value),
            status: job.status,
            endsAt: job.endsAt || undefined,
            createdAt: job.createdAt,
            updatedAt: job.updatedAt,
            location: job.location
                ? {
                    city: job.location.city,
                    country: job.location.country,
                }
                : undefined,
            workArrengment: job.workMode?.mode || undefined,
            employmentType: job.employmentType?.type || undefined,
            salary: job.salary
                ? {
                    type: job.salary.type,
                    amount: job.salary.amount || undefined,
                    currency: job.salary.currency || undefined,
                    period: job.salary.period,
                    benefits: job.salary.benefits || [],
                    notes: job.salary.notes || undefined,
                }
                : undefined,
            createdJobPosting: {
                createdByType: job.createdJobPosting?.createdByType || "system",
                createdById: job.createdJobPosting?.createdById || undefined,
                source: job.createdJobPosting?.source || undefined,
                importedAt: job.createdJobPosting?.importedAt || undefined,
            },
        };
    }
}
exports.JobPostingRepository = JobPostingRepository;
let instance = null;
function getJobPostingRepository() {
    if (!instance) {
        instance = new JobPostingRepository();
    }
    return instance;
}
//# sourceMappingURL=job-posting.repository.js.map