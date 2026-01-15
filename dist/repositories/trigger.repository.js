"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TriggerRepository = void 0;
exports.getTriggerRepository = getTriggerRepository;
const database_1 = require("../config/database");
class TriggerRepository {
    prisma;
    constructor() {
        this.prisma = (0, database_1.getPrismaClient)();
    }
    async findReminderTriggersByDate(dateStr) {
        // Parse date to get start and end of day
        const date = new Date(dateStr);
        const startOfDay = new Date(date.setHours(0, 0, 0, 0)).toISOString();
        const endOfDay = new Date(date.setHours(23, 59, 59, 999)).toISOString();
        const triggers = await this.prisma.triggerDefinition.findMany({
            where: {
                triggerCode: "REMINDER",
                OR: [
                    { executeWhen: null },
                    { executeWhen: "REMINDER" },
                ],
                executeAt: {
                    not: null,
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            orderBy: {
                executeAt: "asc",
            },
        });
        return triggers.map((trigger) => ({
            id: trigger.id,
            order: trigger.order,
            isPublic: trigger.isPublic,
            createdBy: trigger.createdBy,
            triggerCode: trigger.triggerCode,
            executeWhen: trigger.executeWhen || undefined,
            executeAt: trigger.executeAt || undefined,
            combinator: trigger.combinator || undefined,
            config: trigger.config,
            expiration: trigger.expiration || undefined,
            stepId: trigger.stepId || undefined,
        }));
    }
}
exports.TriggerRepository = TriggerRepository;
let instance = null;
function getTriggerRepository() {
    if (!instance) {
        instance = new TriggerRepository();
    }
    return instance;
}
//# sourceMappingURL=trigger.repository.js.map