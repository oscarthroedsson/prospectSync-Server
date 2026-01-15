import { TriggerDefinition } from "../models/trigger.model";
export declare class TriggerRepository {
    private prisma;
    constructor();
    findReminderTriggersByDate(dateStr: string): Promise<TriggerDefinition[]>;
}
export declare function getTriggerRepository(): TriggerRepository;
//# sourceMappingURL=trigger.repository.d.ts.map