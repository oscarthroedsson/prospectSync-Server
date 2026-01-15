import { TriggerService } from "../../../../src/services/trigger/trigger.service";
import { getTriggerRepository } from "../../../../src/repositories/trigger.repository";
import { sampleTrigger } from "../../../helpers/fixtures";

jest.mock("../../../../src/repositories/trigger.repository");

describe("TriggerService", () => {
  let service: TriggerService;
  const mockTriggerRepository = {
    findReminderTriggersByDate: jest.fn(),
  };

  beforeEach(() => {
    (getTriggerRepository as jest.Mock).mockReturnValue(mockTriggerRepository);
    service = new TriggerService();
    jest.clearAllMocks();
  });

  describe("findReminderTriggersForToday", () => {
    it("should find reminder triggers for today", async () => {
      const today = new Date().toISOString().split("T")[0];
      const mockTriggers = [
        {
          ...sampleTrigger,
          config: { _raw: JSON.stringify({ type: "CALL_REMINDER", daysFromNow: 3 }) },
        },
      ];

      mockTriggerRepository.findReminderTriggersByDate.mockResolvedValue(mockTriggers);

      const result = await service.findReminderTriggersForToday();

      expect(mockTriggerRepository.findReminderTriggersByDate).toHaveBeenCalledWith(today);
      expect(result).toHaveLength(1);
      expect(result[0].config.type).toBe("CALL_REMINDER");
      expect(result[0].config._raw).toBeUndefined(); // Should be parsed and removed
    });

    it("should parse JSON config correctly", async () => {
      const mockTriggers = [
        {
          ...sampleTrigger,
          config: {
            _raw: JSON.stringify({
              type: "CALL_REMINDER",
              daysFromNow: 3,
              note: "Follow up",
            }),
          },
        },
      ];

      mockTriggerRepository.findReminderTriggersByDate.mockResolvedValue(mockTriggers);

      const result = await service.findReminderTriggersForToday();

      expect(result[0].config.type).toBe("CALL_REMINDER");
      expect(result[0].config.daysFromNow).toBe(3);
      expect(result[0].config.note).toBe("Follow up");
    });

    it("should handle invalid JSON config gracefully", async () => {
      const mockTriggers = [
        {
          ...sampleTrigger,
          config: { _raw: "invalid json" },
        },
      ];

      mockTriggerRepository.findReminderTriggersByDate.mockResolvedValue(mockTriggers);

      const result = await service.findReminderTriggersForToday();

      expect(result[0].config).toEqual({});
    });

    it("should return empty array when no triggers found", async () => {
      mockTriggerRepository.findReminderTriggersByDate.mockResolvedValue([]);

      const result = await service.findReminderTriggersForToday();

      expect(result).toEqual([]);
    });

    it("should handle triggers without _raw config", async () => {
      const mockTriggers = [
        {
          ...sampleTrigger,
          config: { type: "CALL_REMINDER" },
        },
      ];

      mockTriggerRepository.findReminderTriggersByDate.mockResolvedValue(mockTriggers);

      const result = await service.findReminderTriggersForToday();

      expect(result[0].config.type).toBe("CALL_REMINDER");
    });
  });
});
