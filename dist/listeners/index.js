"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startAllListeners = startAllListeners;
const event_bus_1 = require("../eventbus/event-bus");
const event_types_1 = require("../eventbus/event-types");
const step_service_1 = require("../services/step/step.service");
const action_executor_service_1 = require("../services/action/action-executor.service");
const database_1 = require("../config/database");
function startAllListeners(bus) {
    const eventBus = bus || (0, event_bus_1.getEventBus)();
    jobPostingListener(eventBus);
    reminderListener(eventBus);
}
function jobPostingListener(bus) {
    // Listen for job postings that are expiring soon (within 3 days)
    bus.subscribe(event_types_1.EventType.JOB_POSTING_EXPIRING_SOON, async (e) => {
        const payload = e.payload;
        const jobID = payload.jobId;
        const title = payload.title;
        const companyName = payload.companyName;
        const endsAt = payload.endsAt;
        console.log(`⚠️ [JobPostingListener] Job posting expiring soon - ID: ${jobID}, Title: ${title}, Company: ${companyName}, EndsAt: ${endsAt}`);
        try {
            // Business logic for expiring soon:
            // - Log the event (already done)
            // - Could send notifications to users who saved this job (requires user-job relationship)
            // - Could send email alerts (requires email service integration)
            // - Status remains unchanged until it actually expires
            // TODO: Additional business logic:
            // - Query database for users who have saved/bookmarked this job posting
            // - Send email notifications to those users
            // - Update any related entities or flags
            console.log(`✅ [JobPostingListener] Processed expiring soon event for job: ${jobID}`);
        }
        catch (error) {
            console.error(`❌ [JobPostingListener] Error processing expiring soon event for job ${jobID}:`, error);
        }
    });
    // Listen for job postings that have expired
    bus.subscribe(event_types_1.EventType.JOB_POSTING_EXPIRED, async (e) => {
        const payload = e.payload;
        const jobID = payload.jobId;
        const title = payload.title;
        const companyName = payload.companyName;
        console.log(`🔴 [JobPostingListener] Job posting expired - ID: ${jobID}, Title: ${title}, Company: ${companyName}`);
        try {
            const prisma = (0, database_1.getPrismaClient)();
            // Mark job posting as expired in database
            await prisma.jobPosting.update({
                where: { id: jobID },
                data: { status: "expired" },
            });
            console.log(`✅ [JobPostingListener] Marked job posting ${jobID} as expired in database`);
            // TODO: Additional business logic:
            // - Query database for users who have saved/bookmarked this job posting
            // - Send notifications to those users that the job is no longer available
            // - Archive the job posting (if archiving is needed)
            // - Update any related entities or statistics
        }
        catch (error) {
            console.error(`❌ [JobPostingListener] Error processing expired event for job ${jobID}:`, error);
        }
    });
}
function reminderListener(bus) {
    const stepService = (0, step_service_1.getStepService)();
    const actionExecutor = new action_executor_service_1.ActionExecutor();
    bus.subscribe(event_types_1.EventType.REMINDER_TRIGGER, async (e) => {
        const payload = e.payload;
        const triggerID = payload.triggerId;
        const triggerCode = payload.triggerCode;
        const executeAt = payload.executeAt;
        const config = payload.config;
        const stepID = payload.stepId;
        const createdBy = payload.createdBy;
        console.log(`⏰ [ReminderListener] Reminder trigger fired - ID: ${triggerID}, Code: ${triggerCode}, ExecuteAt: ${executeAt}, StepID: ${stepID}, CreatedBy: ${createdBy}`);
        // Extract config values
        const label = config?.label;
        const description = config?.description;
        const to = config?.to;
        const from = config?.from;
        console.log(`📋 [ReminderListener] Config - Label: ${label}, Description: ${description}, To: ${to}, From: ${from}`);
        // If stepID is present, fetch step with actions and execute them
        if (stepID) {
            console.log(`🔍 [ReminderListener] Fetching step ${stepID} with actions...`);
            const step = await stepService.getStepWithActions(stepID);
            if (!step) {
                console.log(`⚠️ [ReminderListener] Step ${stepID} not found`);
                return;
            }
            console.log(`✅ [ReminderListener] Step found - Name: ${step.name}, Status: ${step.status}, Actions: ${step.actions?.length || 0}`);
            // Execute all actions in order
            if (step.actions && step.actions.length > 0) {
                console.log(`🚀 [ReminderListener] Executing ${step.actions.length} action(s) for step ${stepID}`);
                await actionExecutor.executeActions(step.actions);
                console.log(`✅ [ReminderListener] All actions executed successfully for step ${stepID}`);
            }
            else {
                console.log(`ℹ️ [ReminderListener] No actions found for step ${stepID}`);
            }
        }
        else {
            console.log(`ℹ️ [ReminderListener] No stepId provided, skipping action execution`);
        }
        // Additional business logic:
        try {
            // Check conditions if any (combinator, conditions array)
            const combinator = config?.combinator;
            const conditions = config?.conditions;
            if (combinator && conditions) {
                console.log(`🔍 [ReminderListener] Checking conditions with combinator: ${combinator}, Conditions: ${conditions.length}`);
                // TODO: Implement condition evaluation logic
                // - Evaluate each condition
                // - Apply combinator (AND/OR) to determine if trigger should execute
                // - Skip execution if conditions are not met
            }
            // Handle expiration if present
            const expiration = config?.expiration;
            if (expiration) {
                const expirationDate = new Date(expiration);
                const now = new Date();
                if (expirationDate < now) {
                    console.log(`⚠️ [ReminderListener] Trigger ${triggerID} has expired (expiration: ${expiration}), skipping execution`);
                    return;
                }
            }
            // Log the reminder execution for audit
            console.log(`📝 [ReminderListener] Reminder execution logged - TriggerID: ${triggerID}, StepID: ${stepID}, ExecutedAt: ${new Date().toISOString()}`);
            // TODO: Additional business logic:
            // - Send notifications to the process owner (if not already handled by actions)
            // - Store execution history in database for audit trail
            // - Update trigger execution count or last executed timestamp
        }
        catch (error) {
            console.error(`❌ [ReminderListener] Error in additional business logic for trigger ${triggerID}:`, error);
            // Don't throw - we've already executed actions, just log the error
        }
    });
}
//# sourceMappingURL=index.js.map