import { getTriggerRepository } from "../../repositories/trigger.repository";
import { TriggerDefinition } from "../../models/trigger.model";
import { format } from "date-fns";

export class TriggerService {
  private triggerRepo = getTriggerRepository();

  async findReminderTriggersForToday(): Promise<TriggerDefinition[]> {
    const today = format(new Date(), "yyyy-MM-dd");
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
          } catch (err) {
            console.error(
              `⚠️ [TriggerService] Failed to parse config for trigger ${trigger.id}:`,
              err
            );
            trigger.config = {};
          }
        }
      }
    }

    console.log(
      `📊 [TriggerService] Found ${triggers.length} reminder trigger(s) for today`
    );
    return triggers;
  }
}

let instance: TriggerService | null = null;

export function getTriggerService(): TriggerService {
  if (!instance) {
    instance = new TriggerService();
  }
  return instance;
}
