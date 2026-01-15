import { ActionDefinition } from "../../models/action.model";

const VALID_STATUSES = ["completed", "skipped", "in_progress", "failed"];

export async function executeUpdateStepStatus(
  action: ActionDefinition
): Promise<void> {
  const config = action.config;

  const status = config.status as string;
  const stepId = action.stepId;

  if (!status) {
    throw new Error("UPDATE_STEP_STATUS - Status is required");
  }

  if (!VALID_STATUSES.includes(status)) {
    throw new Error(
      `UPDATE_STEP_STATUS - Invalid status: ${status}. Must be one of: ${VALID_STATUSES.join(", ")}`
    );
  }

  if (!stepId) {
    throw new Error("UPDATE_STEP_STATUS - StepId is required");
  }

  // NOTE: ProcessStep model in Prisma schema does not have a 'status' field
  // This action is currently a no-op until the schema is updated to support status tracking
  console.log(
    `⚠️ [ActionExecutor] UPDATE_STEP_STATUS - StepId: ${stepId}, Status: ${status} (action not implemented - schema does not support status field)`
  );
}
