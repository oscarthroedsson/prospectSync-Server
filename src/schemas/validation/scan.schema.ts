import { z } from "zod";
import { Request, Response, NextFunction } from "express";

// Schema for scanning repo
export const scanRepoSchema = z.object({
  repoUrl: z.string().url("Invalid repository URL"),
  branch: z.string().optional(),
});

export type ScanRepoInput = z.infer<typeof scanRepoSchema>;

// Validation middleware
export const validateScanRepo = (req: Request, res: Response, next: NextFunction) => {
  try {
    req.body = scanRepoSchema.parse(req.body);
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

// Note: scanJobPostingValidation already exists in validation.middleware.ts
// and scan PDF validation is handled by file-upload middleware
