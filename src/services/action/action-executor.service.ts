import { ActionConfigType, ActionDefinition } from "../../Types/action.types";
import { executeCreateCalendarEvent } from "./calendar-event.action";
import { executeUpdateStepStatus } from "./step-status.action";
import { executeSendEmail } from "./send-email.action";
import { executeCallReminder } from "./reminder.action";
import { executeWebhook } from "./webhook.action";
import { executeCreateTask } from "./task.action";

export class ActionExecutor {
  async executeAction(action: ActionDefinition): Promise<void> {
    if (!action.config || Object.keys(action.config).length === 0) {
      console.log(`⚠️ [ActionExecutor] Action ${action.id} has no config, skipping`);
      return;
    }

    const actionType = action.config.type as string;
    if (!actionType) {
      console.log(`⚠️ [ActionExecutor] Action ${action.id} has no type in config, skipping`);
      return;
    }

    console.log(`🚀 [ActionExecutor] Executing action ${action.id} (type: ${actionType})`);

    switch (actionType as ActionConfigType) {
      case ActionConfigType.SEND_EMAIL:
        return executeSendEmail(action);
      case ActionConfigType.CREATE_CALENDAR_EVENT:
        return executeCreateCalendarEvent(action);
      case ActionConfigType.CREATE_TASK:
        return executeCreateTask(action);
      case ActionConfigType.WEBHOOK:
        return executeWebhook(action);
      case ActionConfigType.CALL_REMINDER:
        return executeCallReminder(action);
      case ActionConfigType.UPDATE_STEP_STATUS:
        return executeUpdateStepStatus(action);
      default:
        console.log(`⚠️ [ActionExecutor] Unknown action type: ${actionType}`);
        return;
    }
  }

  async executeActions(actions: ActionDefinition[]): Promise<void> {
    for (const action of actions) {
      try {
        await this.executeAction(action);
      } catch (error) {
        console.error(`❌ [ActionExecutor] Failed to execute action ${action.id}:`, error);
        // Continue with next action even if one fails
      }
    }
  }
}
