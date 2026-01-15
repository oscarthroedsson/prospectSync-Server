"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = registerRoutes;
const scan_routes_1 = __importDefault(require("../routes/scan.routes"));
const analyze_routes_1 = __importDefault(require("../routes/analyze.routes"));
const job_posting_routes_1 = __importDefault(require("../routes/job-posting.routes"));
function registerRoutes(app) {
    app.use("/api/scan", scan_routes_1.default);
    app.use("/api/analyze", analyze_routes_1.default);
    app.use("/api/job-posting", job_posting_routes_1.default);
}
//# sourceMappingURL=index.js.map