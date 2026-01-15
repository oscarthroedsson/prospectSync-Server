export interface ActionDefinition {
    id: string;
    stepId: string;
    name: string;
    isPublic: boolean;
    order: number;
    config: Record<string, any>;
}
export interface ProcessStep {
    id: string;
    processId?: string;
    name: string;
    status?: string;
    order: number;
    actions?: ActionDefinition[];
    metadata?: Record<string, any>;
}
export declare enum ActionConfigType {
    SEND_EMAIL = "SEND_EMAIL",
    CREATE_CALENDAR_EVENT = "CREATE_CALENDAR_EVENT",
    CREATE_TASK = "CREATE_TASK",
    WEBHOOK = "WEBHOOK",
    CALL_REMINDER = "CALL_REMINDER",
    UPDATE_STEP_STATUS = "UPDATE_STEP_STATUS"
}
//# sourceMappingURL=action.model.d.ts.map