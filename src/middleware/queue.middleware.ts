import { Request, Response, NextFunction } from "express";

/**
 * Queue middleware - placeholder for future queue handling
 * Currently just passes through
 */
export function queueMiddleware(
  _req: Request,
  _res: Response,
  next: NextFunction
): void {
  // TODO: Implement queue handling if needed
  // For now, just pass through
  next();
}
