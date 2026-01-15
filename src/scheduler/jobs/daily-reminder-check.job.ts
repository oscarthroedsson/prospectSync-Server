import { Job } from "../scheduler";
import { getTriggerService } from "../../services/trigger/trigger.service";
import { getEventBus } from "../../eventbus/event-bus";
import { EventType } from "../../eventbus/event-types";
import { parseISO, isAfter } from "date-fns";

export class DailyReminderCheck implements Job {
  private triggerService = getTriggerService();
  private bus = getEventBus();

  name(): string {
    return "DailyReminderCheck";
  }

  async run(): Promise<void> {
    console.log("🔍 [DailyReminderCheck] Starting daily reminder check...");

    // Find all REMINDER triggers for today
    const triggers = await this.triggerService.findReminderTriggersForToday();

    if (triggers.length === 0) {
      console.log("ℹ️ [DailyReminderCheck] No reminder triggers found for today");
      return;
    }

    console.log(
      `📊 [DailyReminderCheck] Found ${triggers.length} reminder trigger(s) for today`
    );

    const now = new Date();

    // Process each trigger
    for (const trigger of triggers) {
      if (!trigger.executeAt) {
        console.log(
          `⚠️ [DailyReminderCheck] Trigger ${trigger.id} has no executeAt, skipping`
        );
        continue;
      }

      // Parse executeAt time
      let executeTime: Date;
      try {
        executeTime = parseISO(trigger.executeAt);
      } catch (err) {
        // Try parsing as just date-time without timezone
        try {
          executeTime = new Date(trigger.executeAt);
        } catch (err2) {
          console.error(
            `❌ [DailyReminderCheck] Failed to parse executeAt for trigger ${trigger.id}:`,
            err2
          );
          continue;
        }
      }

      // Create event payload
      const eventPayload = {
        triggerId: trigger.id,
        triggerCode: trigger.triggerCode,
        executeAt: trigger.executeAt,
        config: trigger.config,
        stepId: trigger.stepId || "",
        createdBy: trigger.createdBy,
        order: trigger.order,
      };

      // Normalize both times to UTC for date comparison
      const executeTimeUTC = new Date(
        Date.UTC(
          executeTime.getFullYear(),
          executeTime.getMonth(),
          executeTime.getDate(),
          executeTime.getHours(),
          executeTime.getMinutes(),
          executeTime.getSeconds()
        )
      );
      const nowUTC = new Date(
        Date.UTC(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          now.getHours(),
          now.getMinutes(),
          now.getSeconds()
        )
      );

      // Check if executeAt is on the same day as today
      const isSameDay = this.isSameDay(executeTimeUTC, nowUTC);

      console.log(
        `🔍 [DailyReminderCheck] Trigger ${trigger.id} - executeAt: ${executeTime.toISOString()}, now: ${now.toISOString()}, sameDay: ${isSameDay}`
      );

      // Check if trigger should execute now or be scheduled
      if (isAfter(executeTimeUTC, nowUTC) && isSameDay) {
        // Schedule trigger for future time (same day)
        const delay = executeTime.getTime() - now.getTime();
        console.log(
          `⏰ [DailyReminderCheck] Scheduling trigger ${trigger.id} to execute at ${executeTime.toISOString()} (in ${delay}ms)`
        );

        // Schedule in a setTimeout
        setTimeout(() => {
          console.log(
            `🚀 [DailyReminderCheck] Executing scheduled trigger: ${trigger.id}`
          );

          this.bus.publish({
            type: EventType.REMINDER_TRIGGER,
            payload: eventPayload,
          });

          console.log(
            `📤 [DailyReminderCheck] Published EventReminderTrigger for scheduled trigger: ${trigger.id}`
          );
        }, delay);
      } else if (isSameDay) {
        // Execute immediately (same day but time has passed)
        console.log(
          `⚡ [DailyReminderCheck] Executing trigger ${trigger.id} immediately (executeAt: ${executeTime.toISOString()} was in the past, now: ${now.toISOString()})`
        );

        this.bus.publish({
          type: EventType.REMINDER_TRIGGER,
          payload: eventPayload,
        });

        console.log(
          `📤 [DailyReminderCheck] Published EventReminderTrigger for trigger: ${trigger.id} (executed immediately)`
        );
      } else {
        // Different day - should not happen since query filters by date, but log it
        console.log(
          `⚠️ [DailyReminderCheck] Trigger ${trigger.id} executeAt (${executeTime.toISOString()}) is not on today's date, skipping`
        );
      }
    }

    console.log("✅ [DailyReminderCheck] Daily check completed");
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getUTCFullYear() === date2.getUTCFullYear() &&
      date1.getUTCMonth() === date2.getUTCMonth() &&
      date1.getUTCDate() === date2.getUTCDate()
    );
  }
}
