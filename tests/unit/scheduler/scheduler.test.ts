import { Scheduler } from "../../../src/scheduler/scheduler";
import { Job } from "../../../src/scheduler/scheduler";
import * as cron from "node-cron";

jest.mock("node-cron");

describe("Scheduler", () => {
  let scheduler: Scheduler;
  let mockJob: Job;

  beforeEach(() => {
    scheduler = new Scheduler();
    mockJob = {
      name: jest.fn().mockReturnValue("TestJob"),
      run: jest.fn().mockResolvedValue(undefined),
    };
    jest.clearAllMocks();
  });

  describe("addJob", () => {
    it("should add job and run it immediately", async () => {
      (cron.schedule as jest.Mock).mockReturnValue({
        start: jest.fn(),
        stop: jest.fn(),
      });

      scheduler.addJob(mockJob);

      expect(mockJob.run).toHaveBeenCalled();
      expect(cron.schedule).toHaveBeenCalledWith("0 0 * * *", expect.any(Function));
    });

    it("should schedule job to run at midnight", () => {
      (cron.schedule as jest.Mock).mockReturnValue({
        start: jest.fn(),
        stop: jest.fn(),
      });

      scheduler.addJob(mockJob);

      expect(cron.schedule).toHaveBeenCalledWith("0 0 * * *", expect.any(Function));
    });
  });

  describe("start", () => {
    it("should start all scheduled jobs", () => {
      const mockTask = {
        start: jest.fn(),
        stop: jest.fn(),
      };
      (cron.schedule as jest.Mock).mockReturnValue(mockTask);

      scheduler.addJob(mockJob);
      scheduler.start();

      expect(mockTask.start).toHaveBeenCalled();
    });
  });

  describe("stop", () => {
    it("should stop all scheduled jobs", () => {
      const mockTask = {
        start: jest.fn(),
        stop: jest.fn(),
      };
      (cron.schedule as jest.Mock).mockReturnValue(mockTask);

      scheduler.addJob(mockJob);
      scheduler.start();
      scheduler.stop();

      expect(mockTask.stop).toHaveBeenCalled();
    });
  });
});
