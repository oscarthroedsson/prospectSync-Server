"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIClient = void 0;
exports.getAIClient = getAIClient;
const ai_1 = require("ai");
const openai_1 = require("@ai-sdk/openai");
const zod_1 = require("zod");
const env_1 = require("../config/env");
class AIClient {
    apiKey;
    constructor() {
        this.apiKey = env_1.env.OPENAI_API_KEY;
        if (!this.apiKey) {
            throw new Error("OPENAI_API_KEY is required");
        }
    }
    async generateJobPosting(prompt) {
        // Use structured output with JSON schema
        // For now, using z.any() - can be refined with proper schema conversion
        const result = await (0, ai_1.generateObject)({
            model: (0, openai_1.openai)("gpt-4o-mini"), // Using gpt-4o-mini as equivalent to GPT5Nano
            schema: zod_1.z.any(), // Accept any structure matching the JSON schema
            prompt,
        });
        return result.object;
    }
    async generateResume(prompt) {
        // Use structured output with JSON schema
        // For now, using z.any() - can be refined with proper schema conversion
        const result = await (0, ai_1.generateObject)({
            model: (0, openai_1.openai)("gpt-4o"), // Using gpt-4o as equivalent to GPT5
            schema: zod_1.z.any(), // Accept any structure matching the JSON schema
            prompt,
        });
        return result.object;
    }
}
exports.AIClient = AIClient;
let instance = null;
function getAIClient() {
    if (!instance) {
        instance = new AIClient();
    }
    return instance;
}
//# sourceMappingURL=ai-client.js.map