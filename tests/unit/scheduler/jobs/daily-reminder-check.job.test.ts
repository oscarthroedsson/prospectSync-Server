import { DailyReminderCheck } from "../../../../src/scheduler/jobs/daily-reminder-check.job";
import { getTriggerService } from "../../../../src/services/trigger/trigger.service";
import { getEventBus } from "../../../../src/eventbus/event-bus";
import { EventType } from "../../../../src/eventbus/event-types";
import { sampleTrigger } from "../../../helpers/fixtures";

jest.mock("../../../../src/services/trigger/trigger.service");
jest.mock("../../../../src/eventbus/event-bus");

describe("DailyReminderCheck", () => {
  let job: DailyReminderCheck;
  const mockTriggerService = {
    findReminderTriggersForToday: jest.fn(),
  };
  const mockBus = {
    publish: jest.fn(),
  };

  beforeEach(() => {
    jest.useFakeTimers();
    (getTriggerService as jest.Mock).mockReturnValue(mockTriggerService);
    (getEventBus as jest.Mock).mockReturnValue(mockBus);
    job = new DailyReminderCheck();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("run", () => {
    it("should find triggers for today", async () => {
      mockTriggerService.findReminderTriggersForToday.mockResolvedValue([]);

      await job.run();

      expect(mockTriggerService.findReminderTriggersForToday).toHaveBeenCalled();
    });

    it("should publish event for immediate trigger", async () => {
      const trigger = {
        ...sampleTrigger,
        executeAt: new Date(Date.now() - 1000).toISOString(), // Past time
      };
      mockTriggerService.findReminderTriggersForToday.mockResolvedValue([trigger]);

      await job.run();

      expect(mockBus.publish).toHaveBeenCalledWith({
        type: EventType.REMINDER_TRIGGER,
        payload: expect.objectContaining({
          triggerId: trigger.id,
        }),
      });
    });

    it("should schedule future trigger", async () => {
      const futureTime = new Date(Date.now() + 60000); // 1 minute from now
      const trigger = {
        ...sampleTrigger,
        executeAt: futureTime.toISOString(),
      };
      mockTriggerService.findReminderTriggersForToday.mockResolvedValue([trigger]);

      await job.run();

      // Should not publish immediately
      expect(mockBus.publish).not.toHaveBeenCalled();

      // Fast-forward time
      jest.advanceTimersByTime(60000);

      // After timeout, should publish
      expect(mockBus.publish).toHaveBeenCalled();
    });
  });
});
