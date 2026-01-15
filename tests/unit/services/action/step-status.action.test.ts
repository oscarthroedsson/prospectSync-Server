import { executeUpdateStepStatus } from "../../../../src/services/action/step-status.action";
import { ActionDefinition } from "../../../../src/models/action.model";
import { getPrismaClient } from "../../../../src/config/database";
import { mockPrismaClient } from "../../../helpers/mocks";

jest.mock("../../../../src/config/database", () => ({
  getPrismaClient: jest.fn(),
}));

describe("StepStatus Action", () => {
  beforeEach(() => {
    (getPrismaClient as jest.Mock).mockReturnValue(mockPrismaClient);
    jest.clearAllMocks();
  });

  it("should update step status to completed", async () => {
    const action: ActionDefinition = {
      id: "action-1",
      stepId: "step-1",
      name: "Update Status",
      isPublic: true,
      order: 1,
      config: {
        type: "UPDATE_STEP_STATUS",
        status: "completed",
      },
    };

    mockPrismaClient.processStep.update.mockResolvedValue({
      id: "step-1",
      status: "completed",
    });

    await executeUpdateStepStatus(action);

    expect(mockPrismaClient.processStep.update).toHaveBeenCalledWith({
      where: { id: "step-1" },
      data: { status: "completed" },
    });
  });

  it("should update step status to in_progress", async () => {
    const action: ActionDefinition = {
      id: "action-1",
      stepId: "step-1",
      name: "Update Status",
      isPublic: true,
      order: 1,
      config: {
        type: "UPDATE_STEP_STATUS",
        status: "in_progress",
      },
    };

    mockPrismaClient.processStep.update.mockResolvedValue({
      id: "step-1",
      status: "in_progress",
    });

    await executeUpdateStepStatus(action);

    expect(mockPrismaClient.processStep.update).toHaveBeenCalledWith({
      where: { id: "step-1" },
      data: { status: "in_progress" },
    });
  });

  it("should throw error when status is missing", async () => {
    const action: ActionDefinition = {
      id: "action-1",
      stepId: "step-1",
      name: "Update Status",
      isPublic: true,
      order: 1,
      config: {
        type: "UPDATE_STEP_STATUS",
      },
    };

    await expect(executeUpdateStepStatus(action)).rejects.toThrow("Status is required");
  });

  it("should throw error when status is invalid", async () => {
    const action: ActionDefinition = {
      id: "action-1",
      stepId: "step-1",
      name: "Update Status",
      isPublic: true,
      order: 1,
      config: {
        type: "UPDATE_STEP_STATUS",
        status: "invalid_status",
      },
    };

    await expect(executeUpdateStepStatus(action)).rejects.toThrow("Invalid status");
  });

  it("should throw error when stepId is missing", async () => {
    const action: ActionDefinition = {
      id: "action-1",
      stepId: "",
      name: "Update Status",
      isPublic: true,
      order: 1,
      config: {
        type: "UPDATE_STEP_STATUS",
        status: "completed",
      },
    };

    await expect(executeUpdateStepStatus(action)).rejects.toThrow("StepId is required");
  });

  it("should handle database errors", async () => {
    const action: ActionDefinition = {
      id: "action-1",
      stepId: "step-1",
      name: "Update Status",
      isPublic: true,
      order: 1,
      config: {
        type: "UPDATE_STEP_STATUS",
        status: "completed",
      },
    };

    mockPrismaClient.processStep.update.mockRejectedValue(
      new Error("Database error")
    );

    await expect(executeUpdateStepStatus(action)).rejects.toThrow("Failed to update step status");
  });
});
