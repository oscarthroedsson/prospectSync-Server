import { PrismaClient, Prisma, CreatedByEnum, JobSourceEnum } from "@prisma/client";
import { getPrismaClient } from "../config/database";
import { IJobPosting } from "../models/job-posting.model";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

// Define the include config once
const jobPostingInclude = {
  language: true,
  jobRequirements: true,
  merits: true,
  applicantQualities: true,
  location: true,
  salary: true,
  employmentType: true,
  workArrengment: true,
  createdJobPosting: true,
} satisfies Prisma.JobPostingInclude;

// Type for job posting with all relations
type JobPostingWithRelations = Prisma.JobPostingGetPayload<{
  include: typeof jobPostingInclude;
}>;

export class JobPostingRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = getPrismaClient();
  }

  async create(data: IJobPosting): Promise<IJobPosting> {
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

        language: data.language
          ? {
              create: data.language.map((lang) => ({
                language: lang.language,
                level: lang.level,
              })),
            }
          : undefined,

        jobRequirements: data.jobRequirements
          ? {
              create: data.jobRequirements.map((req) => ({
                requirement: req,
              })),
            }
          : undefined,

        merits: data.merits
          ? {
              create: data.merits.map((merit) => ({
                merit: merit,
              })),
            }
          : undefined,

        applicantQualities: data.applicantQualities
          ? {
              create: data.applicantQualities.map((quality) => ({
                quality: quality,
              })),
            }
          : undefined,

        location: data.location
          ? {
              create: {
                city: data.location.city,
                country: data.location.country,
              },
            }
          : undefined,

        workArrengment: data.workArrengment
          ? {
              create: {
                mode: data.workArrengment,
              },
            }
          : undefined,

        employmentType: data.employmentType
          ? {
              create: {
                type: data.employmentType,
              },
            }
          : undefined,

        salary: data.salary
          ? {
              create: {
                type: data.salary.type,
                amount: data.salary.amount,
                currency: data.salary.currency || "",
                period: data.salary.period,
                benefits: data.salary.benefits,
                notes: data.salary.notes,
              },
            }
          : undefined,

        createdJobPosting: {
          create: {
            createdByType: (data.createdJobPosting.createdByType || "system") as CreatedByEnum,
            createdById: data.createdJobPosting.createdById || null,
            source: (data.createdJobPosting.source as JobSourceEnum) || null,
            importedAt: data.createdJobPosting.importedAt || new Date(),
          },
        },
      },
      include: jobPostingInclude,
    });

    return this.mapToJobPosting(job);
  }

  async show(id: string): Promise<IJobPosting | null> {
    const job = await this.prisma.jobPosting.findUnique({
      where: { id },
      include: jobPostingInclude,
    });

    return job ? this.mapToJobPosting(job) : null;
  }

  async showByUrl(url: string): Promise<IJobPosting | null> {
    const job = await this.prisma.jobPosting.findFirst({
      where: { jobPostingUrl: url },
      include: jobPostingInclude,
    });

    return job ? this.mapToJobPosting(job) : null;
  }

  async ensure(data: IJobPosting): Promise<IJobPosting | null> {
    try {
      return await this.create(data);
    } catch (err) {
      if ((err as PrismaClientKnownRequestError)?.code === "P2002") {
        // Unique constraint violation - job already exists
        if (data.id) return await this.show(data.id);
        return null;
      }
      throw err;
    }
  }

  async upsert(data: IJobPosting): Promise<IJobPosting> {
    try {
      return await this.create(data);
    } catch (err) {
      if ((err as PrismaClientKnownRequestError)?.code === "P2002" && data.id) {
        return await this.update(data.id, data);
      }
      throw err;
    }
  }

  async update(id: string, data: Partial<IJobPosting>): Promise<IJobPosting> {
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

        ...(data.location && {
          location: {
            upsert: {
              where: { jobPostingId: id },
              update: {
                city: data.location.city,
                country: data.location.country,
              },
              create: {
                city: data.location.city,
                country: data.location.country,
              },
            },
          },
        }),

        ...(data.workArrengment && {
          workArrengment: {
            upsert: {
              where: { jobPostingId: id },
              update: { mode: data.workArrengment },
              create: { mode: data.workArrengment },
            },
          },
        }),

        ...(data.employmentType && {
          employmentType: {
            upsert: {
              where: { jobPostingId: id },
              update: { type: data.employmentType },
              create: { type: data.employmentType },
            },
          },
        }),

        ...(data.salary && {
          salary: {
            upsert: {
              where: { jobPostingId: id },
              update: {
                ...(data.salary.type && { type: data.salary.type }),
                ...(data.salary.amount && { amount: data.salary.amount }),
                ...(data.salary.currency && { currency: data.salary.currency }),
                ...(data.salary.period && { period: data.salary.period }),
                ...(data.salary.benefits && { benefits: data.salary.benefits }),
                ...(data.salary.notes && { notes: data.salary.notes }),
              },
              create: {
                type: data.salary.type,
                amount: data.salary.amount,
                currency: data.salary.currency || "",
                period: data.salary.period,
                benefits: data.salary.benefits || [],
                notes: data.salary.notes,
              },
            },
          },
        }),
      } as Prisma.JobPostingUpdateInput,
      include: jobPostingInclude,
    });

    return this.mapToJobPosting(job);
  }

  async remove(id: string): Promise<IJobPosting> {
    const job = await this.prisma.jobPosting.delete({
      where: { id },
      include: jobPostingInclude,
    });

    return this.mapToJobPosting(job);
  }

  async updateWorkArrengment(jobPostingId: string, workMode: string): Promise<void> {
    await this.prisma.jobPostingWorkArrengment.upsert({
      where: { jobPostingId },
      update: { mode: workMode },
      create: { jobPostingId, mode: workMode },
    });
  }

  async findExpiringSoon(daysUntilExpiration: number): Promise<IJobPosting[]> {
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
      include: jobPostingInclude,
      orderBy: { endsAt: "asc" },
    });

    return jobs.map((job) => this.mapToJobPosting(job));
  }

  async findExpired(): Promise<IJobPosting[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const jobs = await this.prisma.jobPosting.findMany({
      where: {
        endsAt: { lt: today.toISOString() },
        status: { not: "expired" },
      },
      include: jobPostingInclude,
      orderBy: { endsAt: "desc" },
    });

    return jobs.map((job) => this.mapToJobPosting(job));
  }

  private mapToJobPosting(job: JobPostingWithRelations): IJobPosting {
    return {
      id: job.id,
      title: job.title,
      companyName: job.companyName,
      companyLogo: job.companyLogo ?? undefined,
      jobPostingUrl: job.jobPostingUrl,
      jobDescription: job.jobDescription ?? undefined,
      markdownText: job.markdownText,
      language: job.language.map((l) => ({
        language: l.language ?? "",
        level: l.level ?? "",
      })),
      jobRequirements: job.jobRequirements.map((r) => r.requirement),
      merits: job.merits.map((m) => m.merit),
      applicantQualities: job.applicantQualities.map((aq) => aq.quality),
      status: job.status,
      endsAt: job.endsAt ?? undefined,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      location: job.location
        ? ({
            city: job.location.city ?? "",
            region: job.location.region ?? undefined,
            country: job.location.country,
            isRemote: job.location.isRemote,
            lat: job.location.lat ?? undefined,
            lng: job.location.lng ?? undefined,
          } as IJobPosting["location"])
        : undefined,
      workArrengment: job.workArrengment?.mode,
      employmentType: job.employmentType?.type,
      salary: job.salary
        ? {
            type: job.salary.type,
            amount: job.salary.amount ?? undefined,
            currency: job.salary.currency ?? undefined,
            period: job.salary.period,
            benefits: job.salary.benefits,
            notes: job.salary.notes ?? undefined,
          }
        : undefined,
      createdJobPosting: {
        createdByType: job.createdJobPosting?.createdByType ?? "system",
        createdById: job.createdJobPosting?.createdById ?? undefined,
        source: job.createdJobPosting?.source ?? undefined,
        importedAt: job.createdJobPosting?.importedAt?.toISOString() ?? undefined,
      },
    };
  }
}

let instance: JobPostingRepository | null = null;

export function getJobPostingRepository(): JobPostingRepository {
  if (!instance) {
    instance = new JobPostingRepository();
  }
  return instance;
}
