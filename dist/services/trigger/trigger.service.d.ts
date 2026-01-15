import { TriggerDefinition } from "../../models/trigger.model";
export declare class TriggerService {
    private triggerRepo;
    findReminderTriggersForToday(): Promise<TriggerDefinition[]>;
}
export declare function getTriggerService(): TriggerService;
//# sourceMappingURL=trigger.service.d.ts.map