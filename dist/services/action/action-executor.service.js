"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionExecutor = void 0;
const action_model_1 = require("../../models/action.model");
const send_email_action_1 = require("./send-email.action");
const webhook_action_1 = require("./webhook.action");
const calendar_event_action_1 = require("./calendar-event.action");
const task_action_1 = require("./task.action");
const reminder_action_1 = require("./reminder.action");
const step_status_action_1 = require("./step-status.action");
class ActionExecutor {
    async executeAction(action) {
        if (!action.config || Object.keys(action.config).length === 0) {
            console.log(`⚠️ [ActionExecutor] Action ${action.id} has no config, skipping`);
            return;
        }
        const actionType = action.config.type;
        if (!actionType) {
            console.log(`⚠️ [ActionExecutor] Action ${action.id} has no type in config, skipping`);
            return;
        }
        console.log(`🚀 [ActionExecutor] Executing action ${action.id} (type: ${actionType})`);
        switch (actionType) {
            case action_model_1.ActionConfigType.SEND_EMAIL:
                return (0, send_email_action_1.executeSendEmail)(action);
            case action_model_1.ActionConfigType.CREATE_CALENDAR_EVENT:
                return (0, calendar_event_action_1.executeCreateCalendarEvent)(action);
            case action_model_1.ActionConfigType.CREATE_TASK:
                return (0, task_action_1.executeCreateTask)(action);
            case action_model_1.ActionConfigType.WEBHOOK:
                return (0, webhook_action_1.executeWebhook)(action);
            case action_model_1.ActionConfigType.CALL_REMINDER:
                return (0, reminder_action_1.executeCallReminder)(action);
            case action_model_1.ActionConfigType.UPDATE_STEP_STATUS:
                return (0, step_status_action_1.executeUpdateStepStatus)(action);
            default:
                console.log(`⚠️ [ActionExecutor] Unknown action type: ${actionType}`);
                return;
        }
    }
    async executeActions(actions) {
        for (const action of actions) {
            try {
                await this.executeAction(action);
            }
            catch (error) {
                console.error(`❌ [ActionExecutor] Failed to execute action ${action.id}:`, error);
                // Continue with next action even if one fails
            }
        }
    }
}
exports.ActionExecutor = ActionExecutor;
//# sourceMappingURL=action-executor.service.js.map