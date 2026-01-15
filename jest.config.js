module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests/unit", "<rootDir>/src"],
  testMatch: ["**/*.test.ts"],
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts", "!src/main.ts"],
  coverageDirectory: "coverage/unit",
  setupFilesAfterEnv: ["<rootDir>/tests/setup/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.ts$": ["ts-jest", {
      tsconfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        moduleResolution: "node",
        resolveJsonModule: true,
      },
    }],
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
};
