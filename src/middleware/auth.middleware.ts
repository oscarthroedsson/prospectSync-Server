import { Request, Response, NextFunction } from "express";

/**
 * Auth middleware - placeholder for future authentication
 * Currently just extracts X-USER-ID header if present
 */
export function authMiddleware(_req: Request, _res: Response, next: NextFunction): void {
  // TODO: Implement actual authentication
  // For now, just pass through
  // X-USER-ID header is already available in req.headers["x-user-id"]
  next();
}
