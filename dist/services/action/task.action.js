"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeCreateTask = executeCreateTask;
const date_fns_1 = require("date-fns");
const step_repository_1 = require("../../repositories/step.repository");
const ASSIGNEE_TYPES = ["PROCESS_OWNER", "CUSTOM", "COUNTERPART", "ALL_COUNTERPARTS", "SYSTEM"];
async function executeCreateTask(action) {
    const config = action.config;
    const title = config.title;
    const datetime = config.datetime;
    const assignee = config.assignee || "PROCESS_OWNER";
    const description = config.description || "";
    const stepId = action.stepId;
    if (!title) {
        throw new Error("CREATE_TASK - Title is required");
    }
    if (assignee && !ASSIGNEE_TYPES.includes(assignee)) {
        throw new Error(`CREATE_TASK - Invalid assignee: ${assignee}. Must be one of: ${ASSIGNEE_TYPES.join(", ")}`);
    }
    console.log(`✅ [ActionExecutor] CREATE_TASK - Title: ${title}, Due: ${datetime || "(no due date)"}, Assignee: ${assignee}`);
    try {
        // Parse due date if provided
        let dueDate = null;
        if (datetime) {
            dueDate = (0, date_fns_1.parseISO)(datetime);
            if (isNaN(dueDate.getTime())) {
                throw new Error(`Invalid datetime format: ${datetime}. Expected ISO 8601 format.`);
            }
        }
        // Resolve assignee based on assignee type
        let assigneeEmail = null;
        switch (assignee) {
            case "PROCESS_OWNER":
                if (!stepId) {
                    throw new Error("CREATE_TASK - StepId is required for PROCESS_OWNER assignee");
                }
                const stepRepo = (0, step_repository_1.getStepRepository)();
                assigneeEmail = await stepRepo.getUserEmailByStepID(stepId);
                if (!assigneeEmail) {
                    throw new Error(`No user email found for step ${stepId}`);
                }
                break;
            case "CUSTOM":
                assigneeEmail = config.email;
                if (!assigneeEmail) {
                    throw new Error("CREATE_TASK - Email is required for CUSTOM assignee");
                }
                break;
            case "COUNTERPART":
            case "ALL_COUNTERPARTS":
            case "SYSTEM":
                // These would require additional implementation
                console.log(`⚠️ [ActionExecutor] CREATE_TASK - Assignee type ${assignee} not fully implemented`);
                break;
        }
        // Prepare task data
        const taskData = {
            title,
            description,
            dueDate: dueDate ? (0, date_fns_1.format)(dueDate, "yyyy-MM-dd'T'HH:mm:ss") : null,
            assignee: assigneeEmail,
            assigneeType: assignee,
            stepId: stepId,
        };
        console.log(`✅ [ActionExecutor] CREATE_TASK - Task data prepared: ${JSON.stringify(taskData, null, 2)}`);
        // TODO: Implement actual task creation
        // This requires integration with a task management system (Asana, Trello, Jira, etc.)
        //
        // Example for a generic task API:
        // const response = await fetch('https://api.taskmanager.com/tasks', {
        //   method: 'POST',
        //   headers: { 'Authorization': `Bearer ${apiToken}`, 'Content-Type': 'application/json' },
        //   body: JSON.stringify(taskData),
        // });
        //
        // For now, we log the task data that would be sent
        console.log(`✅ [ActionExecutor] CREATE_TASK - Task would be created with assignee: ${assigneeEmail || assignee}`);
        if (dueDate) {
            console.log(`   Due date: ${(0, date_fns_1.format)(dueDate, "yyyy-MM-dd HH:mm")}`);
        }
        // Note: To implement this fully, you would need to:
        // 1. Choose a task management system
        // 2. Set up API credentials
        // 3. Map assignee types to the system's user model
        // 4. Handle task creation, updates, and status changes
        // 5. Store task IDs for future reference
    }
    catch (error) {
        console.error(`❌ [ActionExecutor] CREATE_TASK - Error:`, error);
        throw new Error(`Failed to create task: ${error.message}`);
    }
}
//# sourceMappingURL=task.action.js.map