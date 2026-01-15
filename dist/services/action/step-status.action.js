"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeUpdateStepStatus = executeUpdateStepStatus;
const database_1 = require("../../config/database");
const VALID_STATUSES = ["completed", "skipped", "in_progress", "failed"];
async function executeUpdateStepStatus(action) {
    const config = action.config;
    const status = config.status;
    const stepId = action.stepId;
    if (!status) {
        throw new Error("UPDATE_STEP_STATUS - Status is required");
    }
    if (!VALID_STATUSES.includes(status)) {
        throw new Error(`UPDATE_STEP_STATUS - Invalid status: ${status}. Must be one of: ${VALID_STATUSES.join(", ")}`);
    }
    if (!stepId) {
        throw new Error("UPDATE_STEP_STATUS - StepId is required");
    }
    console.log(`🔄 [ActionExecutor] UPDATE_STEP_STATUS - StepId: ${stepId}, Status: ${status}`);
    try {
        const prisma = (0, database_1.getPrismaClient)();
        // Update step status in database
        await prisma.processStep.update({
            where: { id: stepId },
            data: { status },
        });
        console.log(`✅ [ActionExecutor] UPDATE_STEP_STATUS - Successfully updated step ${stepId} to status: ${status}`);
        // TODO: Trigger any side effects if needed
        // - Publish event to event bus
        // - Notify related services
        // - Update related entities
    }
    catch (error) {
        console.error(`❌ [ActionExecutor] UPDATE_STEP_STATUS - Error updating step ${stepId}:`, error);
        throw new Error(`Failed to update step status: ${error.message}`);
    }
}
//# sourceMappingURL=step-status.action.js.map