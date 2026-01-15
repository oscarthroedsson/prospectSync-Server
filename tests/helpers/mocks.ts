// Shared mocks for testing

export const mockPrismaClient = {
  jobPosting: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  processStep: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  actionDefinition: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
  triggerDefinition: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
  userProcessStep: {
    findFirst: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
  $disconnect: jest.fn(),
};

export const mockAIClient = {
  generateJobPosting: jest.fn(),
  generateResume: jest.fn(),
};

export const mockPuppeteer = {
  launch: jest.fn(),
};

export const mockFetch = jest.fn();

export const mockPdfParse = jest.fn();

// Reset all mocks
export function resetAllMocks(): void {
  Object.values(mockPrismaClient).forEach((mock) => {
    if (typeof mock === "object" && mock !== null) {
      Object.values(mock).forEach((fn) => {
        if (jest.isMockFunction(fn)) {
          fn.mockReset();
        }
      });
    }
  });
  mockAIClient.generateJobPosting.mockReset();
  mockAIClient.generateResume.mockReset();
  mockPuppeteer.launch.mockReset();
  mockFetch.mockReset();
  mockPdfParse.mockReset();
}
