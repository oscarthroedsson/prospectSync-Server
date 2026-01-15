import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";

// Extend Request type to include timeout timer
declare module "express-serve-static-core" {
  interface Request {
    _timeout?: NodeJS.Timeout;
    timedout?: boolean;
  }
}

// Default timeout: 30 seconds
const DEFAULT_TIMEOUT = env.REQUEST_TIMEOUT || 30000;

// Custom timeout for scan endpoints: 60 seconds
export const scanTimeout = createTimeout(env.SCAN_REQUEST_TIMEOUT || 60000);

// Default timeout middleware
export const requestTimeout = createTimeout(DEFAULT_TIMEOUT);

// Create timeout middleware
function createTimeout(timeoutMs: number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Set timeout
    req._timeout = setTimeout(() => {
      req.timedout = true;
      if (!res.headersSent) {
        res.status(408).json({
          error: "Request Timeout",
          message: "The request took too long to process",
        });
        res.end();
      }
    }, timeoutMs);

    // Clear timeout when response finishes
    const originalEnd = res.end.bind(res);
    res.end = function (chunk?: any, encoding?: any, cb?: () => void): Response {
      if (req._timeout) {
        clearTimeout(req._timeout);
        delete req._timeout;
      }
      return originalEnd(chunk, encoding, cb);
    };

    next();
  };
}

// Timeout handler middleware (checks if request timed out)
export function timeoutHandler(req: Request, _res: Response, next: NextFunction): void {
  // Already handled by timeout middleware
  if (req.timedout) return;
  next();
}
