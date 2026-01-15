import { z } from "zod/v4";

/**
 * 🤖 Using for openAI structured output, nothing is aloud to be optional here → AI rules
 */

export const JobPostingSchema = z.object({
  title: z.string(),
  companyName: z.string(),
  companyLogo: z.string().nullable(),

  createdJobPosting: z.object({
    createdByType: z.enum(["system", "user"]),
    createdById: z.string().nullable(),
    source: z.enum(["linkedin", "file_import", "api", "url"]).nullable(),
    importedAt: z.string().nullable(),
  }),

  jobPostingUrl: z.string(),
  jobDescription: z.string(),

  markdownText: z.string().max(5000),

  language: z.array(
    z.object({
      language: z.string(),
      level: z.string().nullable(),
    })
  ),

  jobRequirements: z.array(z.string()),
  merits: z.array(z.string()),

  applicantQualities: z.array(z.string().regex(/^[a-z]+(_[a-z]+)*$/, "Single or snake_case only")),

  status: z.enum(["active", "closed", "draft"]),

  endsAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),

  location: z
    .object({
      city: z.string().default(""),
      country: z.string().default(""),
    })
    .nullable(),

  workArrengment: z.enum([
    "remote_full_time",
    "remote_part_time",
    "hybrid_full_time",
    "hybrid_part_time",
    "onsite_full_time",
    "onsite_part_time",
    "flexible_full_time",
    "flexible_part_time",
  ]),

  employmentType: z.enum(["full_time", "part_time", "contract", "temporary", "internship", "freelance"]),

  salary: z
    .object({
      type: z.enum(["range", "fixed", "competitive", "negotiable", "not_specified"]),
      amount: z.string().nullable(),
      currency: z.string().nullable(),
      period: z.enum(["monthly", "annually", "hourly", "weekly"]),
      benefits: z.array(z.string()),
      notes: z.string().nullable(),
    })
    .nullable(),
});
