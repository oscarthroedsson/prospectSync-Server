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

  status: z.enum(["active", "closed", "draft"]),

  endsAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),

  // Nested PreferenceSet structure
  preferenceSet: z.object({
    languages: z.array(
      z.object({
        language: z.string(),
        level: z.string().nullable(),
        isNative: z.boolean().nullable(),
      }),
    ),

    requirements: z.array(
      z.object({
        requirement: z.string(),
      }),
    ),

    merits: z.array(
      z.object({
        merit: z.string(),
      }),
    ),

    applicantQualities: z.array(
      z.object({
        quality: z.string().regex(/^[a-z]+(_[a-z]+)*$/, "Single or snake_case only"),
      }),
    ),

    locations: z.array(
      z.object({
        city: z.string().nullable(),
        region: z.string().nullable(),
        country: z.string(),
        isRemote: z.boolean(),
        lat: z.number().nullable(),
        lng: z.number().nullable(),
      }),
    ),

    workArrangements: z.array(
      z.object({
        mode: z.enum([
          "remote_full_time",
          "remote_part_time",
          "hybrid_full_time",
          "hybrid_part_time",
          "onsite_full_time",
          "onsite_part_time",
          "flexible_full_time",
          "flexible_part_time",
        ]),
      }),
    ),

    employmentTypes: z.array(
      z.object({
        type: z.enum(["full_time", "part_time", "contract", "temporary", "internship", "freelance", "trainee"]),
      }),
    ),

    salaries: z.array(
      z.object({
        minAmount: z.number().nullable(),
        maxAmount: z.number().nullable(),
        currency: z.string(),
        period: z.string(),
        notes: z.string().nullable(),
      }),
    ),

    benefits: z.array(
      z.object({
        name: z.string(),
        description: z.string().nullable(),
      }),
    ),
  }),
});
