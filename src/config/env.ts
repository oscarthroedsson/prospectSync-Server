import dotenv from "dotenv";

dotenv.config();

console.info("🔑 Env file loaded");
export const env = {
  // Database
  DATABASE_URL: process.env.DATABASE_URL || "",
  DATABASE_POOL_SIZE: parseInt(process.env.DATABASE_POOL_SIZE || "20", 10),
  DATABASE_POOL_TIMEOUT: parseInt(process.env.DATABASE_POOL_TIMEOUT || "10", 10),
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

  // Request Timeouts
  REQUEST_TIMEOUT: parseInt(process.env.REQUEST_TIMEOUT || "30000", 10),
  SCAN_REQUEST_TIMEOUT: parseInt(process.env.SCAN_REQUEST_TIMEOUT || "60000", 10),

  // Cache TTLs (in seconds)
  CACHE_TTL_JOB_POSTING: parseInt(process.env.CACHE_TTL_JOB_POSTING || "300", 10), // 5 minutes
  CACHE_TTL_STEP: parseInt(process.env.CACHE_TTL_STEP || "600", 10), // 10 minutes
  CACHE_TTL_TRIGGER: parseInt(process.env.CACHE_TTL_TRIGGER || "900", 10), // 15 minutes

  // Puppeteer Browser Pool
  PUPPETEER_MAX_BROWSERS: parseInt(process.env.PUPPETEER_MAX_BROWSERS || "10", 10),
  PUPPETEER_BROWSER_TIMEOUT: parseInt(process.env.PUPPETEER_BROWSER_TIMEOUT || "60000", 10),
  PUPPETEER_BROWSER_IDLE_TIMEOUT: parseInt(process.env.PUPPETEER_BROWSER_IDLE_TIMEOUT || "300000", 10), // 5 minutes
  PUPPETEER_QUEUE_MAX_SIZE: parseInt(process.env.PUPPETEER_QUEUE_MAX_SIZE || "100", 10),
};
