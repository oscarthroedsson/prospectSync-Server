import { Request, Response, NextFunction } from "express";
import * as jose from "jose";
import { env } from "../config/env";
import { logger } from "../config/logger";

/**
 * Require authentication middleware
 * Verifies NextAuth JWT token from Authorization header
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "Missing or invalid authorization header" });
      return;
    }

    const token = authHeader.substring(7);

    // Verify NextAuth JWT token
    if (!env.NEXTAUTH_SECRET) {
      logger.error("NEXTAUTH_SECRET is not configured");
      res.status(500).json({ error: "Authentication service not configured" });
      return;
    }

    try {
      const secret = new TextEncoder().encode(env.NEXTAUTH_SECRET);
      const { payload } = await jose.jwtVerify(token, secret);

      // Extract user ID from JWT payload
      // NextAuth stores user ID in 'sub' claim or custom 'userId' field
      req.userId = (payload.sub as string) || (payload.userId as string);

      if (!req.userId) {
        logger.warn("JWT token missing user ID", { payload });
        res.status(401).json({ error: "Invalid token structure" });
        return;
      }

      next();
    } catch (jwtError) {
      logger.warn("JWT verification failed", { 
        error: jwtError instanceof Error ? jwtError.message : String(jwtError) 
      });
      res.status(401).json({ error: "Invalid or expired token" });
    }
  } catch (error) {
    next(error);
  }
}

/**
 * Optional auth middleware - extracts user if token present, but doesn't require it
 * Useful for endpoints that work with or without authentication
 */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ") || !env.NEXTAUTH_SECRET) {
      // No auth header or NextAuth not configured, continue without user
      next();
      return;
    }

    const token = authHeader.substring(7);

    try {
      const secret = new TextEncoder().encode(env.NEXTAUTH_SECRET);
      const { payload } = await jose.jwtVerify(token, secret);
      
      req.userId = (payload.sub as string) || (payload.userId as string);
    } catch {
      // Ignore JWT verification errors for optional auth
      logger.debug("Optional auth: JWT verification failed, continuing without user");
    }

    next();
  } catch (error) {
    // Ignore auth errors for optional auth
    next();
  }
}

// Export legacy middleware for backward compatibility
export const authMiddleware = optionalAuth;
