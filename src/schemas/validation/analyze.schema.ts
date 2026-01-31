import { z } from "zod";
import { Request, Response, NextFunction } from "express";

// Schema for analyzing GitHub repository
export const analyzeRepoSchema = z.object({
  owner: z.string().min(1, "Owner is required").trim(),
  name: z.string().min(1, "Repository name is required").trim(),
  defaultBranch: z.string().trim().optional(),
});

export type AnalyzeRepoInput = z.infer<typeof analyzeRepoSchema>;

// Validation middleware
export const validateAnalyzeRepo = (req: Request, res: Response, next: NextFunction) => {
  try {
    req.body = analyzeRepoSchema.parse(req.body);
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
