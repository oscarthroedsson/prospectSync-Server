// Test database helpers

import { mockPrismaClient } from "./mocks";

export function getTestPrisma(): typeof mockPrismaClient {
  return mockPrismaClient;
}

export async function setupTestDatabase(): Promise<void> {
  // For unit tests, we use mocks
  // For integration tests, you would connect to a real test database here
  // Example:
  // testPrisma = new PrismaClient({
  //   datasources: {
  //     db: {
  //       url: process.env.TEST_DATABASE_URL,
  //     },
  //   },
  // });
}

export async function cleanupTestDatabase(): Promise<void> {
  // Cleanup test database
  // For integration tests, you would clean up test data here
  // Example:
  // await testPrisma.jobPosting.deleteMany({});
  // await testPrisma.processStep.deleteMany({});
  // await testPrisma.triggerDefinition.deleteMany({});
}

export async function seedTestDatabase(): Promise<void> {
  // Seed test database with initial data
  // For integration tests, you would insert test fixtures here
}
