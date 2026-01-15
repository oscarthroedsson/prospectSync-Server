"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analyze_controller_1 = require("../controllers/analyze.controller");
const router = (0, express_1.Router)();
const analyzeController = new analyze_controller_1.AnalyzeController();
router.post("/repository", (req, res) => analyzeController.analyzeGithubRepo(req, res));
exports.default = router;
//# sourceMappingURL=analyze.routes.js.map