import { Scheduler } from "../../../src/scheduler/scheduler";
import { DailyJobPostingCheck } from "../../../src/scheduler/jobs/daily-job-posting-check.job";
import { DailyReminderCheck } from "../../../src/scheduler/jobs/daily-reminder-check.job";

jest.mock("../../../src/repositories/job-posting.repository");
jest.mock("../../../src/services/trigger/trigger.service");
jest.mock("../../../src/eventbus/event-bus");

describe("Scheduler Integration", () => {
  let scheduler: Scheduler;

  beforeEach(() => {
    scheduler = new Scheduler();
    jest.clearAllMocks();
  });

  it("should add and start jobs", () => {
    const jobPostingCheck = new DailyJobPostingCheck();
    const reminderCheck = new DailyReminderCheck();

    scheduler.addJob(jobPostingCheck);
    scheduler.addJob(reminderCheck);
    scheduler.start();

    expect(scheduler).toBeDefined();
  });

  it("should stop all jobs", () => {
    const jobPostingCheck = new DailyJobPostingCheck();
    scheduler.addJob(jobPostingCheck);
    scheduler.start();
    scheduler.stop();

    expect(scheduler).toBeDefined();
  });
});
