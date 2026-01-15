"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = errorMiddleware;
function errorMiddleware(err, _req, res, _next) {
    console.error("❌ [Error] Unhandled error:", err);
    res.status(500).json({
        error: "Internal server error",
        message: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
}
//# sourceMappingURL=error.middleware.js.map