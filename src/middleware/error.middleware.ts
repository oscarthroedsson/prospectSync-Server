import { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger";

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error("Unhandled error", {
    error: err.message,
    stack: err.stack,
    name: err.name,
  });

  // Handle Prisma connection errors
  if (err.message.includes("Too many connections") || err.message.includes("P1001")) {
    res.status(503).json({
      error: "Service Unavailable",
      message: "Database connection pool exhausted. Please try again later.",
    });
    res.setHeader("Retry-After", "10");
    return;
  }

  // Handle browser pool exhausted errors
  if (
    err.message.includes("Browser pool exhausted") ||
    err.message.includes("queue is full")
  ) {
    res.status(503).json({
      error: "Service Unavailable",
      message: "Scraping service is currently at capacity. Please try again later.",
    });
    res.setHeader("Retry-After", "30");
    return;
  }

  // Handle timeout errors
  if (err.message.includes("timeout") || err.message.includes("Timeout")) {
    res.status(408).json({
      error: "Request Timeout",
      message: "The request took too long to process.",
    });
    return;
  }

  // Default error response
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
}
