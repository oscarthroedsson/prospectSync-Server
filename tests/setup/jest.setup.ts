// Global test setup
// This file runs before each test file

// Mock console methods to reduce noise in tests (optional)
// Uncomment if you want to suppress console logs during tests
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };

// Set test environment variables
process.env.NODE_ENV = "test";
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || "postgresql://test:test@localhost:5432/test_db";
process.env.OPENAI_API_KEY = "test-openai-key";
process.env.WEBHOOK_BASE_URL = "http://localhost:3001/webhook";
process.env.WEBHOOK_SECRET = "test-webhook-secret";
process.env.MAILERSEND_API_TOKEN = "test-mailersend-token";
