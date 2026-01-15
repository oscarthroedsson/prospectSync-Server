"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
/**
 * Auth middleware - placeholder for future authentication
 * Currently just extracts X-USER-ID header if present
 */
function authMiddleware(_req, _res, next) {
    // TODO: Implement actual authentication
    // For now, just pass through
    // X-USER-ID header is already available in req.headers["x-user-id"]
    next();
}
//# sourceMappingURL=auth.middleware.js.map