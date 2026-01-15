import { getStepRepository } from "../../repositories/step.repository";
import { cacheService } from "../cache/cache.service";
import { ProcessStep } from "../../models/action.model";

export class StepService {
  private stepRepo = getStepRepository();
  private cache = cacheService.step;

  async getStepWithActions(stepID: string): Promise<ProcessStep | null> {
    if (!stepID) {
      console.log("⚠️ [StepService] Empty stepID provided");
      return null;
    }

    // Check cache first
    const cached = await this.cache.get(stepID);
    if (cached) return cached as ProcessStep;

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
          } catch (err) {
            console.error(`⚠️ [StepService] Failed to parse config for action ${action.id}:`, err);
            action.config = {};
          }
        }
      }
    }

    const result = {
      ...step,
      actions,
    };

    // Cache the result
    await this.cache.set(stepID, result);

    return result;
  }
}

let instance: StepService | null = null;

export function getStepService(): StepService {
  if (!instance) instance = new StepService();
  return instance;
}
