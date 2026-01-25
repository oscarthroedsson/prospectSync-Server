import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { Prisma, PrismaClient } from "@prisma/client";

import { IJobPostingCreateDTO, IJobPostingUpdateDTO } from "../Types/job-postingt.types";
import { getPrismaClient } from "../config/prisma";

// Define the include config once
export const DEFAULT_JOB_POSTING_INCLUDE = {
  createdJobPosting: true,
  company: true,
  preferenceSet: {
    include: {
      languages: true,
      locations: true,
      workArrangements: true,
      employmentTypes: true,
      salaries: true,
      benefits: true,
      requirements: true,
      merits: true,
      applicantQualities: true,
    },
  },
  jobApplicants: true,
  userProcesses: true,
} satisfies Prisma.JobPostingInclude;

// Type for job posting with all relations
export type IJobPostingFull = Prisma.JobPostingGetPayload<{
  include: typeof DEFAULT_JOB_POSTING_INCLUDE;
}>;

export class JobPostingRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = getPrismaClient();
  }

  async create(data: IJobPostingCreateDTO): Promise<IJobPostingFull> {
    const preferenceSet = data.preferenceSet;

    const job = await this.prisma.jobPosting.create({
      data: {
        title: data.title,
        companyName: data.companyName,
        companyLogo: data.companyLogo,
        jobPostingUrl: data.jobPostingUrl,
        jobDescription: data.jobDescription ?? "",
        markdownText: data.markdownText,
        status: data.status || "active",
        endsAt: data.endsAt,

        // Skapa nested PreferenceSet
        preferenceSet: preferenceSet
          ? {
              create: {
                languages:
                  preferenceSet.languages && preferenceSet.languages.length > 0
                    ? {
                        create: preferenceSet.languages.map((l) => ({
                          language: l.language,
                          level: l.level,
                          isNative: l.isNative,
                        })),
                      }
                    : undefined,

                requirements:
                  preferenceSet.requirements && preferenceSet.requirements.length > 0
                    ? {
                        create: preferenceSet.requirements.map((r) => ({
                          requirement: r.requirement,
                        })),
                      }
                    : undefined,

                merits:
                  preferenceSet.merits && preferenceSet.merits.length > 0
                    ? {
                        create: preferenceSet.merits.map((m) => ({
                          merit: m.merit,
                        })),
                      }
                    : undefined,

                applicantQualities:
                  preferenceSet.applicantQualities && preferenceSet.applicantQualities.length > 0
                    ? {
                        create: preferenceSet.applicantQualities.map((aq) => ({
                          quality: aq.quality,
                        })),
                      }
                    : undefined,

                locations:
                  preferenceSet.locations && preferenceSet.locations.length > 0
                    ? {
                        create: preferenceSet.locations.map((loc) => ({
                          city: loc.city,
                          region: loc.region,
                          country: loc.country,
                          isRemote: loc.isRemote,
                          lat: loc.lat,
                          lng: loc.lng,
                        })),
                      }
                    : undefined,

                workArrangements:
                  preferenceSet.workArrangements && preferenceSet.workArrangements.length > 0
                    ? {
                        create: preferenceSet.workArrangements.map((wa) => ({
                          mode: wa.mode,
                        })),
                      }
                    : undefined,

                employmentTypes:
                  preferenceSet.employmentTypes && preferenceSet.employmentTypes.length > 0
                    ? {
                        create: preferenceSet.employmentTypes.map((et) => ({
                          type: et.type,
                        })),
                      }
                    : undefined,

                salaries:
                  preferenceSet.salaries && preferenceSet.salaries.length > 0
                    ? {
                        create: preferenceSet.salaries.map((s) => ({
                          minAmount: s.minAmount,
                          maxAmount: s.maxAmount,
                          currency: s.currency,
                          period: s.period,
                          notes: s.notes,
                        })),
                      }
                    : undefined,

                benefits:
                  preferenceSet.benefits && preferenceSet.benefits.length > 0
                    ? {
                        create: preferenceSet.benefits.map((b) => ({
                          name: b.name,
                          description: b.description,
                        })),
                      }
                    : undefined,
              },
            }
          : undefined,

        createdJobPosting: data.createdJobPosting
          ? {
              create: {
                createdByType: data.createdJobPosting.createdByType || "system",
                createdById: data.createdJobPosting.createdById || null,
                source: data.createdJobPosting.source || null,
                importedAt: data.createdJobPosting.importedAt || new Date(),
              },
            }
          : undefined,
      },
      include: DEFAULT_JOB_POSTING_INCLUDE,
    });

    return job;
  }

  async show(id: string): Promise<IJobPostingFull | null> {
    const job = await this.prisma.jobPosting.findUnique({
      where: { id },
      include: DEFAULT_JOB_POSTING_INCLUDE,
    });

    return job;
  }

  async showByUrl(url: string): Promise<IJobPostingFull | null> {
    const job = await this.prisma.jobPosting.findFirst({
      where: { jobPostingUrl: url },
      include: DEFAULT_JOB_POSTING_INCLUDE,
    });

    return job;
  }

  async ensure(data: IJobPostingCreateDTO): Promise<IJobPostingFull | null> {
    try {
      return await this.create(data);
    } catch (err) {
      if ((err as PrismaClientKnownRequestError)?.code === "P2002") {
        // Unique constraint violation - job already exists
        // Try to find by URL instead
        return await this.showByUrl(data.jobPostingUrl);
      }
      throw err;
    }
  }

  async upsert(data: IJobPostingCreateDTO): Promise<IJobPostingFull> {
    try {
      return await this.create(data);
    } catch (err) {
      if ((err as PrismaClientKnownRequestError)?.code === "P2002") {
        // Find existing by URL and update it
        const existing = await this.showByUrl(data.jobPostingUrl);
        if (existing) {
          return await this.update(existing.id, data);
        }
      }
      throw err;
    }
  }

  async update(id: string, data: IJobPostingUpdateDTO): Promise<IJobPostingFull> {
    const job = await this.prisma.jobPosting.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.companyName && { companyName: data.companyName }),
        ...(data.companyLogo && { companyLogo: data.companyLogo }),
        ...(data.jobPostingUrl && { jobPostingUrl: data.jobPostingUrl }),
        ...(data.jobDescription && { jobDescription: data.jobDescription }),
        ...(data.markdownText && { markdownText: data.markdownText }),
        ...(data.status && { status: data.status }),
        ...(data.endsAt && { endsAt: data.endsAt }),
      } as Prisma.JobPostingUpdateInput,
      include: DEFAULT_JOB_POSTING_INCLUDE,
    });

    return job;
  }

  async remove(id: string): Promise<IJobPostingFull> {
    const job = await this.prisma.jobPosting.delete({
      where: { id },
      include: DEFAULT_JOB_POSTING_INCLUDE,
    });

    return job;
  }

  async findExpiringSoon(daysUntilExpiration: number): Promise<IJobPostingFull[]> {
    const now = new Date();
    const futureDate = new Date(now.getTime() + daysUntilExpiration * 24 * 60 * 60 * 1000);

    const jobs = await this.prisma.jobPosting.findMany({
      where: {
        endsAt: {
          gte: now.toISOString(),
          lte: futureDate.toISOString(),
        },
        status: { not: "expired" },
      },
      include: DEFAULT_JOB_POSTING_INCLUDE,
      orderBy: { endsAt: "asc" },
    });

    return jobs;
  }

  async findExpired(): Promise<IJobPostingFull[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const jobs = await this.prisma.jobPosting.findMany({
      where: {
        endsAt: { lt: today.toISOString() },
        status: { not: "expired" },
      },
      include: DEFAULT_JOB_POSTING_INCLUDE,
      orderBy: { endsAt: "desc" },
    });

    return jobs;
  }
}

let instance: JobPostingRepository | null = null;

export function getJobPostingRepository(): JobPostingRepository {
  if (!instance) {
    instance = new JobPostingRepository();
  }
  return instance;
}
