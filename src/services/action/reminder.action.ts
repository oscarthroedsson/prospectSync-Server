import { ActionDefinition } from "../../models/action.model";
import { addDays, format } from "date-fns";
import { getPrismaClient } from "../../config/database";
import { TriggerEventCode } from "@prisma/client";

export async function executeCallReminder(action: ActionDefinition): Promise<void> {
  const config = action.config;

  const daysFromNow = config.daysFromNow as number;
  const note = (config.note as string) || "";
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
    const reminderDate = addDays(today, daysFromNow);
    const executeAt = format(reminderDate, "yyyy-MM-dd'T'HH:mm:ss");

    const prisma = getPrismaClient();

    // Create reminder trigger in database
    // This creates a REMINDER trigger that will be picked up by the daily reminder check job
    await prisma.triggerDefinition.create({
      data: {
        order: 0,
        isPublic: false,
        createdBy: "system",
        triggerCode: "REMINDER",
        executeWhen: TriggerEventCode.REMINDER,
        executeAt: executeAt,
        stepId: stepId,
        config: {
          type: "CALL_REMINDER",
          note: note,
          daysFromNow: daysFromNow,
        },
      },
    });

    console.log(
      `✅ [ActionExecutor] CALL_REMINDER - Successfully created reminder for ${executeAt} (${daysFromNow} days from now)`
    );
  } catch (error: any) {
    console.error(`❌ [ActionExecutor] CALL_REMINDER - Error creating reminder:`, error);
    throw new Error(`Failed to create call reminder: ${error.message}`);
  }
}
