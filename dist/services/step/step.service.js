"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StepService = void 0;
exports.getStepService = getStepService;
const step_repository_1 = require("../../repositories/step.repository");
class StepService {
    stepRepo = (0, step_repository_1.getStepRepository)();
    async getStepWithActions(stepID) {
        if (!stepID) {
            console.log("⚠️ [StepService] Empty stepID provided");
            return null;
        }
        const step = await this.stepRepo.getStepByID(stepID);
        if (!step) {
            console.log(`ℹ️ [StepService] Step ${stepID} not found`);
            return null;
        }
        const actions = await this.stepRepo.getActionsByStepID(stepID);
        // Parse JSON config for each action
        for (const action of actions) {
            if (action.config && typeof action.config === "object" && "_raw" in action.config) {
                const rawJSON = action.config._raw;
                delete action.config._raw;
                if (rawJSON && typeof rawJSON === "string") {
                    try {
                        action.config = JSON.parse(rawJSON);
                    }
                    catch (err) {
                        console.error(`⚠️ [StepService] Failed to parse config for action ${action.id}:`, err);
                        action.config = {};
                    }
                }
            }
        }
        return {
            ...step,
            actions,
        };
    }
}
exports.StepService = StepService;
let instance = null;
function getStepService() {
    if (!instance) {
        instance = new StepService();
    }
    return instance;
}
//# sourceMappingURL=step.service.js.map