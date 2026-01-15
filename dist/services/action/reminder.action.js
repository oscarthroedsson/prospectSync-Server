"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeCallReminder = executeCallReminder;
const date_fns_1 = require("date-fns");
const database_1 = require("../../config/database");
async function executeCallReminder(action) {
    const config = action.config;
    const daysFromNow = config.daysFromNow;
    const note = config.note || "";
    const stepId = action.stepId;
    if (daysFromNow === undefined || daysFromNow === null) {
        throw new Error("CALL_REMINDER - daysFromNow is required");
    }
    if (!stepId) {
        throw new Error("CALL_REMINDER - StepId is required (reminder must be associated with a step)");
    }
    console.log(`📞 [ActionExecutor] CALL_REMINDER - Days from now: ${daysFromNow}, Note: ${note || "(none)"}`);
    try {
        // Calculate reminder date (today + daysFromNow)
        const today = new Date();
        const reminderDate = (0, date_fns_1.addDays)(today, daysFromNow);
        const executeAt = (0, date_fns_1.format)(reminderDate, "yyyy-MM-dd'T'HH:mm:ss");
        const prisma = (0, database_1.getPrismaClient)();
        // Create reminder trigger in database
        // This creates a REMINDER trigger that will be picked up by the daily reminder check job
        await prisma.triggerDefinition.create({
            data: {
                order: 0,
                isPublic: false,
                createdBy: "system",
                triggerCode: "REMINDER",
                executeWhen: "REMINDER",
                executeAt: executeAt,
                stepId: stepId,
                config: {
                    type: "CALL_REMINDER",
                    note: note,
                    daysFromNow: daysFromNow,
                },
            },
        });
        console.log(`✅ [ActionExecutor] CALL_REMINDER - Successfully created reminder for ${executeAt} (${daysFromNow} days from now)`);
    }
    catch (error) {
        console.error(`❌ [ActionExecutor] CALL_REMINDER - Error creating reminder:`, error);
        throw new Error(`Failed to create call reminder: ${error.message}`);
    }
}
//# sourceMappingURL=reminder.action.js.map