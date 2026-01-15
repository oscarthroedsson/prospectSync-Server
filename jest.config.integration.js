module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests/integration", "<rootDir>/src"],
  testMatch: ["**/*.test.ts"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup/jest.setup.ts"],
  globalTeardown: "<rootDir>/tests/setup/jest.teardown.ts",
  testTimeout: 30000, // Longer timeout för integration tests
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.ts$": ["ts-jest", {
      tsconfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    }],
  },
};
