import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { Request } from "express";

// Key generator for user-based rate limiting
const getUserKey = (req: Request): string => {
  const userId = req.headers["x-user-id"] as string;
  if (userId) return userId;

  // Use ipKeyGenerator helper for IPv6 support
  // ipKeyGenerator takes an IP address string, not the request object
  return ipKeyGenerator(req.ip || req.socket.remoteAddress || "unknown");
};

// User-based API rate limiter (preferred)
export const userApiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each user to 200 requests per windowMs
  keyGenerator: getUserKey,
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    // Skip if no user-id header (fallback to IP-based)
    return !req.headers["x-user-id"];
  },
});

// IP-based API rate limiter (fallback)
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    // Skip if user-id header exists (use user-based instead)
    return !!req.headers["x-user-id"];
  },
});

// User-based scan rate limiter (preferred)
export const userScanRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // Limit each user to 20 scan requests per minute
  keyGenerator: getUserKey,
  message: "Too many scan requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    // Skip if no user-id header (fallback to IP-based)
    return !req.headers["x-user-id"];
  },
});

// IP-based scan rate limiter (fallback)
export const scanRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 scan requests per minute
  message: "Too many scan requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    // Skip if user-id header exists (use user-based instead)
    return !!req.headers["x-user-id"];
  },
});
