import { getEventBus } from "../eventbus/event-bus";
import { EventType, Event } from "../eventbus/event-types";
import { getStepService } from "../services/step/step.service";
import { ActionExecutor } from "../services/action/action-executor.service";
import { getPrismaClient } from "../config/database";

export function startAllListeners(bus?: ReturnType<typeof getEventBus>): void {
  const eventBus = bus || getEventBus();
  
  jobPostingListener(eventBus);
  reminderListener(eventBus);
}

function jobPostingListener(bus: ReturnType<typeof getEventBus>): void {
  // Listen for job postings that are expiring soon (within 3 days)
  bus.subscribe(EventType.JOB_POSTING_EXPIRING_SOON, async (e: Event) => {
    const payload = e.payload as Record<string, any>;
    
    const jobID = payload.jobId as string;
    const title = payload.title as string;
    const companyName = payload.companyName as string;
    const endsAt = payload.endsAt as string;

    console.log(
      `⚠️ [JobPostingListener] Job posting expiring soon - ID: ${jobID}, Title: ${title}, Company: ${companyName}, EndsAt: ${endsAt}`
    );

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
      
      console.log(
        `✅ [JobPostingListener] Processed expiring soon event for job: ${jobID}`
      );
    } catch (error: any) {
      console.error(
        `❌ [JobPostingListener] Error processing expiring soon event for job ${jobID}:`,
        error
      );
    }
  });

  // Listen for job postings that have expired
  bus.subscribe(EventType.JOB_POSTING_EXPIRED, async (e: Event) => {
    const payload = e.payload as Record<string, any>;
    
    const jobID = payload.jobId as string;
    const title = payload.title as string;
    const companyName = payload.companyName as string;

    console.log(
      `🔴 [JobPostingListener] Job posting expired - ID: ${jobID}, Title: ${title}, Company: ${companyName}`
    );

    try {
      const prisma = getPrismaClient();

      // Mark job posting as expired in database
      await prisma.jobPosting.update({
        where: { id: jobID },
        data: { status: "expired" },
      });

      console.log(
        `✅ [JobPostingListener] Marked job posting ${jobID} as expired in database`
      );

      // TODO: Additional business logic:
      // - Query database for users who have saved/bookmarked this job posting
      // - Send notifications to those users that the job is no longer available
      // - Archive the job posting (if archiving is needed)
      // - Update any related entities or statistics
      
    } catch (error: any) {
      console.error(
        `❌ [JobPostingListener] Error processing expired event for job ${jobID}:`,
        error
      );
    }
  });
}

function reminderListener(bus: ReturnType<typeof getEventBus>): void {
  const stepService = getStepService();
  const actionExecutor = new ActionExecutor();

  bus.subscribe(EventType.REMINDER_TRIGGER, async (e: Event) => {
    const payload = e.payload as Record<string, any>;

    const triggerID = payload.triggerId as string;
    const triggerCode = payload.triggerCode as string;
    const executeAt = payload.executeAt as string;
    const config = payload.config as Record<string, any>;
    const stepID = payload.stepId as string;
    const createdBy = payload.createdBy as string;

    console.log(
      `⏰ [ReminderListener] Reminder trigger fired - ID: ${triggerID}, Code: ${triggerCode}, ExecuteAt: ${executeAt}, StepID: ${stepID}, CreatedBy: ${createdBy}`
    );

    // Extract config values
    const label = config?.label as string;
    const description = config?.description as string;
    const to = config?.to as string;
    const from = config?.from as string;

    console.log(
      `📋 [ReminderListener] Config - Label: ${label}, Description: ${description}, To: ${to}, From: ${from}`
    );

    // If stepID is present, fetch step with actions and execute them
    if (stepID) {
      console.log(`🔍 [ReminderListener] Fetching step ${stepID} with actions...`);

      const step = await stepService.getStepWithActions(stepID);
      if (!step) {
        console.log(`⚠️ [ReminderListener] Step ${stepID} not found`);
        return;
      }

      console.log(
        `✅ [ReminderListener] Step found - Name: ${step.name}, Actions: ${step.actions?.length || 0}`
      );

      // Execute all actions in order
      if (step.actions && step.actions.length > 0) {
        console.log(
          `🚀 [ReminderListener] Executing ${step.actions.length} action(s) for step ${stepID}`
        );
        await actionExecutor.executeActions(step.actions);
        console.log(
          `✅ [ReminderListener] All actions executed successfully for step ${stepID}`
        );
      } else {
        console.log(`ℹ️ [ReminderListener] No actions found for step ${stepID}`);
      }
    } else {
      console.log(`ℹ️ [ReminderListener] No stepId provided, skipping action execution`);
    }

    // Additional business logic:
    try {
      // Check conditions if any (combinator, conditions array)
      const combinator = config?.combinator as string;
      const conditions = config?.conditions as any[];
      
      if (combinator && conditions) {
        console.log(
          `🔍 [ReminderListener] Checking conditions with combinator: ${combinator}, Conditions: ${conditions.length}`
        );
        // TODO: Implement condition evaluation logic
        // - Evaluate each condition
        // - Apply combinator (AND/OR) to determine if trigger should execute
        // - Skip execution if conditions are not met
      }

      // Handle expiration if present
      const expiration = config?.expiration as string;
      if (expiration) {
        const expirationDate = new Date(expiration);
        const now = new Date();
        if (expirationDate < now) {
          console.log(
            `⚠️ [ReminderListener] Trigger ${triggerID} has expired (expiration: ${expiration}), skipping execution`
          );
          return;
        }
      }

      // Log the reminder execution for audit
      console.log(
        `📝 [ReminderListener] Reminder execution logged - TriggerID: ${triggerID}, StepID: ${stepID}, ExecutedAt: ${new Date().toISOString()}`
      );

      // TODO: Additional business logic:
      // - Send notifications to the process owner (if not already handled by actions)
      // - Store execution history in database for audit trail
      // - Update trigger execution count or last executed timestamp
      
    } catch (error: any) {
      console.error(
        `❌ [ReminderListener] Error in additional business logic for trigger ${triggerID}:`,
        error
      );
      // Don't throw - we've already executed actions, just log the error
    }
  });
}
