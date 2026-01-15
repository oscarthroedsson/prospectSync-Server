import { TriggerRepository } from "../../../src/repositories/trigger.repository";
import { getPrismaClient } from "../../../src/config/database";
import { mockPrismaClient } from "../../helpers/mocks";

jest.mock("../../../src/config/database", () => ({
  getPrismaClient: jest.fn(),
}));

describe("TriggerRepository", () => {
  let repository: TriggerRepository;

  beforeEach(() => {
    (getPrismaClient as jest.Mock).mockReturnValue(mockPrismaClient);
    repository = new TriggerRepository();
    jest.clearAllMocks();
  });

  describe("findReminderTriggersByDate", () => {
    it("should find reminder triggers for a specific date", async () => {
      const dateStr = "2024-01-15";
      const mockTriggers = [
        {
          id: "trigger-1",
          order: 1,
          isPublic: false,
          createdBy: "user-123",
          triggerCode: "REMINDER",
          executeWhen: "REMINDER",
          executeAt: "2024-01-15T10:00:00Z",
          combinator: null,
          config: { type: "CALL_REMINDER", daysFromNow: 3 },
          expiration: null,
          stepId: "step-1",
        },
      ];

      mockPrismaClient.triggerDefinition.findMany.mockResolvedValue(mockTriggers);

      const result = await repository.findReminderTriggersByDate(dateStr);

      expect(mockPrismaClient.triggerDefinition.findMany).toHaveBeenCalledWith({
        where: {
          triggerCode: "REMINDER",
          OR: [{ executeWhen: null }, { executeWhen: "REMINDER" }],
          executeAt: {
            not: null,
            gte: expect.any(String),
            lte: expect.any(String),
          },
        },
        orderBy: {
          executeAt: "asc",
        },
      });

      expect(result).toHaveLength(1);
      expect(result[0].triggerCode).toBe("REMINDER");
      expect(result[0].executeAt).toBe("2024-01-15T10:00:00Z");
    });

    it("should handle nullable fields correctly", async () => {
      const dateStr = "2024-01-15";
      const mockTriggers = [
        {
          id: "trigger-1",
          order: 1,
          isPublic: false,
          createdBy: "user-123",
          triggerCode: "REMINDER",
          executeWhen: null,
          executeAt: "2024-01-15T10:00:00Z",
          combinator: null,
          config: {},
          expiration: null,
          stepId: null,
        },
      ];

      mockPrismaClient.triggerDefinition.findMany.mockResolvedValue(mockTriggers);

      const result = await repository.findReminderTriggersByDate(dateStr);

      expect(result[0].executeWhen).toBeUndefined();
      expect(result[0].combinator).toBeUndefined();
      expect(result[0].expiration).toBeUndefined();
      expect(result[0].stepId).toBeUndefined();
    });

    it("should return empty array when no triggers found", async () => {
      mockPrismaClient.triggerDefinition.findMany.mockResolvedValue([]);

      const result = await repository.findReminderTriggersByDate("2024-01-15");

      expect(result).toEqual([]);
    });

    it("should order triggers by executeAt ascending", async () => {
      const dateStr = "2024-01-15";
      const mockTriggers = [
        {
          id: "trigger-1",
          order: 1,
          isPublic: false,
          createdBy: "user-123",
          triggerCode: "REMINDER",
          executeWhen: "REMINDER",
          executeAt: "2024-01-15T14:00:00Z",
          combinator: null,
          config: {},
          expiration: null,
          stepId: null,
        },
        {
          id: "trigger-2",
          order: 2,
          isPublic: false,
          createdBy: "user-123",
          triggerCode: "REMINDER",
          executeWhen: "REMINDER",
          executeAt: "2024-01-15T10:00:00Z",
          combinator: null,
          config: {},
          expiration: null,
          stepId: null,
        },
      ];

      mockPrismaClient.triggerDefinition.findMany.mockResolvedValue(mockTriggers);

      const result = await repository.findReminderTriggersByDate(dateStr);

      expect(result).toHaveLength(2);
      // Results should be ordered by executeAt ascending
      expect(result[0].executeAt).toBe("2024-01-15T10:00:00Z");
      expect(result[1].executeAt).toBe("2024-01-15T14:00:00Z");
    });
  });
});
