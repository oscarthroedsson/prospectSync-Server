import { executeCallReminder } from "../../../../src/services/action/reminder.action";
import { ActionDefinition } from "../../../../src/models/action.model";
import { getPrismaClient } from "../../../../src/config/database";
import { mockPrismaClient } from "../../../helpers/mocks";
import { format, addDays } from "date-fns";

jest.mock("../../../../src/config/database", () => ({
  getPrismaClient: jest.fn(),
}));

describe("Reminder Action", () => {
  beforeEach(() => {
    (getPrismaClient as jest.Mock).mockReturnValue(mockPrismaClient);
    jest.clearAllMocks();
  });

  it("should create reminder trigger with correct date", async () => {
    const action: ActionDefinition = {
      id: "action-1",
      stepId: "step-1",
      name: "Call Reminder",
      isPublic: true,
      order: 1,
      config: {
        type: "CALL_REMINDER",
        daysFromNow: 3,
        note: "Follow up call",
      },
    };

    mockPrismaClient.triggerDefinition.create.mockResolvedValue({
      id: "trigger-1",
    });

    await executeCallReminder(action);

    const today = new Date();
    const reminderDate = addDays(today, 3);

    expect(mockPrismaClient.triggerDefinition.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        triggerCode: "REMINDER",
        executeWhen: "REMINDER",
        stepId: "step-1",
        config: expect.objectContaining({
          type: "CALL_REMINDER",
          note: "Follow up call",
          daysFromNow: 3,
        }),
      }),
    });

    const callData = mockPrismaClient.triggerDefinition.create.mock.calls[0][0].data;
    expect(callData.executeAt).toContain(format(reminderDate, "yyyy-MM-dd"));
  });

  it("should throw error when daysFromNow is missing", async () => {
    const action: ActionDefinition = {
      id: "action-1",
      stepId: "step-1",
      name: "Call Reminder",
      isPublic: true,
      order: 1,
      config: {
        type: "CALL_REMINDER",
        note: "Follow up",
      },
    };

    await expect(executeCallReminder(action)).rejects.toThrow("daysFromNow is required");
  });

  it("should throw error when stepId is missing", async () => {
    const action: ActionDefinition = {
      id: "action-1",
      stepId: "",
      name: "Call Reminder",
      isPublic: true,
      order: 1,
      config: {
        type: "CALL_REMINDER",
        daysFromNow: 3,
      },
    };

    await expect(executeCallReminder(action)).rejects.toThrow("StepId is required");
  });

  it("should handle missing note", async () => {
    const action: ActionDefinition = {
      id: "action-1",
      stepId: "step-1",
      name: "Call Reminder",
      isPublic: true,
      order: 1,
      config: {
        type: "CALL_REMINDER",
        daysFromNow: 3,
      },
    };

    mockPrismaClient.triggerDefinition.create.mockResolvedValue({
      id: "trigger-1",
    });

    await executeCallReminder(action);

    const callData = mockPrismaClient.triggerDefinition.create.mock.calls[0][0].data;
    expect(callData.config.note).toBe("");
  });

  it("should handle database errors", async () => {
    const action: ActionDefinition = {
      id: "action-1",
      stepId: "step-1",
      name: "Call Reminder",
      isPublic: true,
      order: 1,
      config: {
        type: "CALL_REMINDER",
        daysFromNow: 3,
      },
    };

    mockPrismaClient.triggerDefinition.create.mockRejectedValue(
      new Error("Database error")
    );

    await expect(executeCallReminder(action)).rejects.toThrow("Failed to create call reminder");
  });
});
