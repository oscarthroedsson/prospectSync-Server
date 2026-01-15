import { ActionExecutor } from "../../../src/services/action/action-executor.service";
import { ActionDefinition, ActionConfigType } from "../../../src/models/action.model";
import { getPrismaClient } from "../../../src/config/database";
import { mockPrismaClient } from "../../helpers/mocks";

jest.mock("../../../src/config/database");
jest.mock("../../../src/services/action/send-email.action");
jest.mock("../../../src/services/action/webhook.action");
jest.mock("../../../src/services/action/step-status.action");

describe("ActionExecutor Integration", () => {
  let executor: ActionExecutor;

  beforeEach(() => {
    (getPrismaClient as jest.Mock).mockReturnValue(mockPrismaClient);
    executor = new ActionExecutor();
    jest.clearAllMocks();
  });

  it("should execute multiple actions in sequence", async () => {
    const actions: ActionDefinition[] = [
      {
        id: "action-1",
        stepId: "step-1",
        name: "Send Email",
        isPublic: true,
        order: 1,
        config: {
          type: ActionConfigType.SEND_EMAIL,
          to: "CUSTOM",
          email: "test@example.com",
          subject: "Test",
          content: "Test",
        },
      },
      {
        id: "action-2",
        stepId: "step-1",
        name: "Update Status",
        isPublic: true,
        order: 2,
        config: {
          type: ActionConfigType.UPDATE_STEP_STATUS,
          status: "completed",
        },
      },
    ];

    const sendEmail = require("../../../src/services/action/send-email.action");
    const stepStatus = require("../../../src/services/action/step-status.action");

    sendEmail.executeSendEmail.mockResolvedValue(undefined);
    stepStatus.executeUpdateStepStatus.mockResolvedValue(undefined);

    await executor.executeActions(actions);

    expect(sendEmail.executeSendEmail).toHaveBeenCalled();
    expect(stepStatus.executeUpdateStepStatus).toHaveBeenCalled();
  });
});
