import { z } from "zod";
import { Request, Response, NextFunction } from "express";

// Schema for creating job posting
export const createJobPostingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  companyName: z.string().min(1, "Company name is required"),
  jobPostingUrl: z.string().url("Invalid job posting URL"),
  jobDescription: z.string().min(1, "Job description is required"),
  // Add more fields as needed
});

// Schema for updating job posting
export const updateJobPostingSchema = z.object({
  url: z.string().url("Invalid URL").optional(),
  title: z.string().min(1).optional(),
  companyName: z.string().min(1).optional(),
  jobDescription: z.string().min(1).optional(),
  status: z.string().optional(),
  // Add more fields as needed
});

// Schema for showing/deleting job posting
export const jobPostingUrlSchema = z.object({
  url: z.string().url("Invalid URL"),
});

export type CreateJobPostingInput = z.infer<typeof createJobPostingSchema>;
export type UpdateJobPostingInput = z.infer<typeof updateJobPostingSchema>;

// Validation middleware
export const validateCreateJobPosting = (req: Request, res: Response, next: NextFunction) => {
  try {
    req.body = createJobPostingSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Validation failed",
        details: error.issues.map((err: z.ZodIssue) => ({
          path: err.path.join("."),
          message: err.message,
        })),
      });
      return;
    }
    next(error);
  }
};

export const validateUpdateJobPosting = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate body
    req.body = updateJobPostingSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Validation failed",
        details: error.issues.map((err: z.ZodIssue) => ({
          path: err.path.join("."),
          message: err.message,
        })),
      });
      return;
    }
    next(error);
  }
};

export const validateJobPostingUrl = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate query parameters
    req.query = jobPostingUrlSchema.parse(req.query);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Validation failed",
        details: error.issues.map((err: z.ZodIssue) => ({
          path: err.path.join("."),
          message: err.message,
        })),
      });
      return;
    }
    next(error);
  }
};
