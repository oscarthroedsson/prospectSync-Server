export interface TriggerDefinition {
    id: string;
    order: number;
    isPublic: boolean;
    createdBy: string;
    triggerCode: string;
    executeWhen?: string;
    executeAt?: string;
    combinator?: string;
    config: Record<string, any>;
    expiration?: string;
    stepId?: string;
}
//# sourceMappingURL=trigger.model.d.ts.map