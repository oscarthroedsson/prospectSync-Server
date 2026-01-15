import { ProcessStep } from "../../models/action.model";
export declare class StepService {
    private stepRepo;
    getStepWithActions(stepID: string): Promise<ProcessStep | null>;
}
export declare function getStepService(): StepService;
//# sourceMappingURL=step.service.d.ts.map