"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
require("express-async-errors");
function createApp() {
    const app = (0, express_1.default)();
    // Security
    app.use((0, helmet_1.default)());
    // CORS - match Go version config
    app.use((0, cors_1.default)({
        origin: "http://localhost:3000",
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allowedHeaders: ["Accept", "Authorization", "Content-Type", "X-USER-ID"],
        credentials: true,
    }));
    // Body parsing
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: true }));
    // Health check
    app.get("/api/health", (_req, res) => {
        res.json({ status: "ok" });
    });
    return app;
}
//# sourceMappingURL=app.js.map