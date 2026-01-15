"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TriggerService = void 0;
exports.getTriggerService = getTriggerService;
const trigger_repository_1 = require("../../repositories/trigger.repository");
const date_fns_1 = require("date-fns");
class TriggerService {
    triggerRepo = (0, trigger_repository_1.getTriggerRepository)();
    async findReminderTriggersForToday() {
        const today = (0, date_fns_1.format)(new Date(), "yyyy-MM-dd");
        console.log(`🔍 [TriggerService] Looking for triggers for date: ${today}`);
        const triggers = await this.triggerRepo.findReminderTriggersByDate(today);
        // Parse JSON config for each trigger
        for (const trigger of triggers) {
            if (trigger.config && typeof trigger.config === "object" && "_raw" in trigger.config) {
                const rawJSON = trigger.config._raw;
                delete trigger.config._raw;
                if (rawJSON && typeof rawJSON === "string") {
                    try {
                        trigger.config = JSON.parse(rawJSON);
                    }
                    catch (err) {
                        console.error(`⚠️ [TriggerService] Failed to parse config for trigger ${trigger.id}:`, err);
                        trigger.config = {};
                    }
                }
            }
        }
        console.log(`📊 [TriggerService] Found ${triggers.length} reminder trigger(s) for today`);
        return triggers;
    }
}
exports.TriggerService = TriggerService;
let instance = null;
function getTriggerService() {
    if (!instance) {
        instance = new TriggerService();
    }
    return instance;
}
//# sourceMappingURL=trigger.service.js.map