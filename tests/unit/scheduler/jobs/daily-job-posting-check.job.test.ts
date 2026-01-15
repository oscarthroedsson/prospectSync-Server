import { DailyJobPostingCheck } from "../../../../src/scheduler/jobs/daily-job-posting-check.job";
import { getJobPostingRepository } from "../../../../src/repositories/job-posting.repository";
import { getEventBus } from "../../../../src/eventbus/event-bus";
import { EventType } from "../../../../src/eventbus/event-types";
import { sampleJobPosting } from "../../../helpers/fixtures";

jest.mock("../../../../src/repositories/job-posting.repository");
jest.mock("../../../../src/eventbus/event-bus");

describe("DailyJobPostingCheck", () => {
  let job: DailyJobPostingCheck;
  const mockRepo = {
    findExpired: jest.fn(),
    findExpiringSoon: jest.fn(),
  };
  const mockBus = {
    publish: jest.fn(),
  };

  beforeEach(() => {
    (getJobPostingRepository as jest.Mock).mockReturnValue(mockRepo);
    (getEventBus as jest.Mock).mockReturnValue(mockBus);
    job = new DailyJobPostingCheck();
    jest.clearAllMocks();
  });

  describe("run", () => {
    it("should check expired and expiring jobs", async () => {
      mockRepo.findExpired.mockResolvedValue([]);
      mockRepo.findExpiringSoon.mockResolvedValue([]);

      await job.run();

      expect(mockRepo.findExpired).toHaveBeenCalled();
      expect(mockRepo.findExpiringSoon).toHaveBeenCalled();
    });

    it("should publish events for expired jobs", async () => {
      const expiredJob = { ...sampleJobPosting, id: "job-1" };
      mockRepo.findExpired.mockResolvedValue([expiredJob]);
      mockRepo.findExpiringSoon.mockResolvedValue([]);

      await job.run();

      expect(mockBus.publish).toHaveBeenCalledWith({
        type: EventType.JOB_POSTING_EXPIRED,
        payload: expect.objectContaining({
          jobId: "job-1",
        }),
      });
    });

    it("should publish events for expiring jobs", async () => {
      const expiringJob = { ...sampleJobPosting, id: "job-2" };
      mockRepo.findExpired.mockResolvedValue([]);
      mockRepo.findExpiringSoon.mockResolvedValue([expiringJob]);

      await job.run();

      expect(mockBus.publish).toHaveBeenCalledWith({
        type: EventType.JOB_POSTING_EXPIRING_SOON,
        payload: expect.objectContaining({
          jobId: "job-2",
        }),
      });
    });
  });
});
