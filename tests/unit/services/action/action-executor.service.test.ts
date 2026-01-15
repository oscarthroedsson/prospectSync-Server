import { ActionExecutor } from "../../../../src/services/action/action-executor.service";
import { ActionDefinition, ActionConfigType } from "../../../../src/models/action.model";
import * as sendEmailAction from "../../../../src/services/action/send-email.action";
import * as webhookAction from "../../../../src/services/action/webhook.action";
import * as stepStatusAction from "../../../../src/services/action/step-status.action";
import * as reminderAction from "../../../../src/services/action/reminder.action";

jest.mock("../../../../src/services/action/send-email.action");
jest.mock("../../../../src/services/action/webhook.action");
jest.mock("../../../../src/services/action/step-status.action");
jest.mock("../../../../src/services/action/reminder.action");
jest.mock("../../../../src/services/action/calendar-event.action");
jest.mock("../../../../src/services/action/task.action");

describe("ActionExecutor", () => {
  let executor: ActionExecutor;

  beforeEach(() => {
    executor = new ActionExecutor();
    jest.clearAllMocks();
  });

  describe("executeAction", () => {
    it("should execute SEND_EMAIL action", async () => {
      const action: ActionDefinition = {
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
          content: "Test content",
        },
      };

      (sendEmailAction.executeSendEmail as jest.Mock).mockResolvedValue(undefined);

      await executor.executeAction(action);

      expect(sendEmailAction.executeSendEmail).toHaveBeenCalledWith(action);
    });

    it("should execute WEBHOOK action", async () => {
      const action: ActionDefinition = {
        id: "action-2",
        stepId: "step-1",
        name: "Webhook",
        isPublic: true,
        order: 2,
        config: {
          type: ActionConfigType.WEBHOOK,
          url: "https://example.com/webhook",
          method: "POST",
        },
      };

      (webhookAction.executeWebhook as jest.Mock).mockResolvedValue(undefined);

      await executor.executeAction(action);

      expect(webhookAction.executeWebhook).toHaveBeenCalledWith(action);
    });

    it("should execute UPDATE_STEP_STATUS action", async () => {
      const action: ActionDefinition = {
        id: "action-3",
        stepId: "step-1",
        name: "Update Status",
        isPublic: true,
        order: 3,
        config: {
          type: ActionConfigType.UPDATE_STEP_STATUS,
          status: "completed",
        },
      };

      (stepStatusAction.executeUpdateStepStatus as jest.Mock).mockResolvedValue(undefined);

      await executor.executeAction(action);

      expect(stepStatusAction.executeUpdateStepStatus).toHaveBeenCalledWith(action);
    });

    it("should execute CALL_REMINDER action", async () => {
      const action: ActionDefinition = {
        id: "action-4",
        stepId: "step-1",
        name: "Reminder",
        isPublic: true,
        order: 4,
        config: {
          type: ActionConfigType.CALL_REMINDER,
          daysFromNow: 3,
          note: "Follow up",
        },
      };

      (reminderAction.executeCallReminder as jest.Mock).mockResolvedValue(undefined);

      await executor.executeAction(action);

      expect(reminderAction.executeCallReminder).toHaveBeenCalledWith(action);
    });

    it("should skip action without config", async () => {
      const action: ActionDefinition = {
        id: "action-5",
        stepId: "step-1",
        name: "No Config",
        isPublic: true,
        order: 5,
        config: {},
      };

      await executor.executeAction(action);

      expect(sendEmailAction.executeSendEmail).not.toHaveBeenCalled();
      expect(webhookAction.executeWebhook).not.toHaveBeenCalled();
    });

    it("should skip action without type", async () => {
      const action: ActionDefinition = {
        id: "action-6",
        stepId: "step-1",
        name: "No Type",
        isPublic: true,
        order: 6,
        config: {
          someField: "value",
        },
      };

      await executor.executeAction(action);

      expect(sendEmailAction.executeSendEmail).not.toHaveBeenCalled();
    });

    it("should handle unknown action type", async () => {
      const action: ActionDefinition = {
        id: "action-7",
        stepId: "step-1",
        name: "Unknown",
        isPublic: true,
        order: 7,
        config: {
          type: "UNKNOWN_TYPE" as any,
        },
      };

      await executor.executeAction(action);

      expect(sendEmailAction.executeSendEmail).not.toHaveBeenCalled();
    });
  });

  describe("executeActions", () => {
    it("should execute multiple actions in sequence", async () => {
      const actions: ActionDefinition[] = [
        {
          id: "action-1",
          stepId: "step-1",
          name: "Action 1",
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
          name: "Action 2",
          isPublic: true,
          order: 2,
          config: {
            type: ActionConfigType.WEBHOOK,
            url: "https://example.com/webhook",
            method: "POST",
          },
        },
      ];

      (sendEmailAction.executeSendEmail as jest.Mock).mockResolvedValue(undefined);
      (webhookAction.executeWebhook as jest.Mock).mockResolvedValue(undefined);

      await executor.executeActions(actions);

      expect(sendEmailAction.executeSendEmail).toHaveBeenCalledTimes(1);
      expect(webhookAction.executeWebhook).toHaveBeenCalledTimes(1);
    });

    it("should continue execution even if one action fails", async () => {
      const actions: ActionDefinition[] = [
        {
          id: "action-1",
          stepId: "step-1",
          name: "Action 1",
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
          name: "Action 2",
          isPublic: true,
          order: 2,
          config: {
            type: ActionConfigType.WEBHOOK,
            url: "https://example.com/webhook",
            method: "POST",
          },
        },
      ];

      (sendEmailAction.executeSendEmail as jest.Mock).mockRejectedValue(
        new Error("Email failed")
      );
      (webhookAction.executeWebhook as jest.Mock).mockResolvedValue(undefined);

      await executor.executeActions(actions);

      expect(sendEmailAction.executeSendEmail).toHaveBeenCalled();
      expect(webhookAction.executeWebhook).toHaveBeenCalled();
    });
  });
});
