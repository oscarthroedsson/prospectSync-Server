import { ProcessStep, ActionDefinition } from "../models/action.model";
export declare class StepRepository {
    private prisma;
    constructor();
    getStepByID(stepID: string): Promise<ProcessStep | null>;
    getActionsByStepID(stepID: string): Promise<ActionDefinition[]>;
    getUserEmailByStepID(stepID: string): Promise<string | null>;
}
export declare function getStepRepository(): StepRepository;
//# sourceMappingURL=step.repository.d.ts.map