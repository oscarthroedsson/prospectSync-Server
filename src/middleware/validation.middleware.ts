import { Request, Response, NextFunction } from "express";
import { query, validationResult } from "express-validator";

export function validateRequest(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
}

// Validation rules for scan routes
export const scanJobPostingValidation = [query("url").isURL().withMessage("url must be a valid URL"), validateRequest];

// Validation rules for other routes can be added here
