"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.env = {
    // Database
    DATABASE_URL: process.env.DATABASE_URL || "",
    BLUEPRINT_DB_DATABASE: process.env.BLUEPRINT_DB_DATABASE || "",
    BLUEPRINT_DB_PASSWORD: process.env.BLUEPRINT_DB_PASSWORD || "",
    BLUEPRINT_DB_USERNAME: process.env.BLUEPRINT_DB_USERNAME || "",
    BLUEPRINT_DB_PORT: process.env.BLUEPRINT_DB_PORT || "",
    BLUEPRINT_DB_HOST: process.env.BLUEPRINT_DB_HOST || "",
    BLUEPRINT_DB_SCHEMA: process.env.BLUEPRINT_DB_SCHEMA || "",
    // Supabase
    SUPABASE_URL: process.env.SUPABASE_URL || "",
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    // Server
    PORTCODE: process.env.PORTCODE || process.env.PORT || "8080",
    NODE_ENV: process.env.NODE_ENV || "development",
    // External Services
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
    MAILERSEND_API_TOKEN: process.env.MAILERSEND_API_TOKEN || "",
    MAILERSEND_FROM_EMAIL: process.env.MAILERSEND_FROM_EMAIL || "",
    MAILERSEND_FROM_NAME: process.env.MAILERSEND_FROM_NAME || "",
    MAILERSEND_TEST_TO_EMAIL: process.env.MAILERSEND_TEST_TO_EMAIL || "",
    WEBHOOK_BASE_URL: process.env.WEBHOOK_BASE_URL || "",
    WEBHOOK_SECRET: process.env.WEBHOOK_SECRET || "",
    // PDF Processing (legacy)
    UNIDOC_LICENSE_API_KEY: process.env.UNIDOC_LICENSE_API_KEY || "",
};
//# sourceMappingURL=env.js.map