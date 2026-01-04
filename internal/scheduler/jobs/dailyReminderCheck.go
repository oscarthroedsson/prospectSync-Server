package jobs

import (
	"context"
	"log"

	"prospectsync-server/internal/eventbus"
	"prospectsync-server/internal/service/trigger"
)

// DailyReminderCheck is a scheduled job that checks for REMINDER triggers
// that should execute today and publishes events to the event bus
type DailyReminderCheck struct {
	triggerService *trigger.Service
	bus            *eventbus.Bus
}

// NewDailyReminderCheck creates a new daily reminder check job
func NewDailyReminderCheck(triggerService *trigger.Service, bus *eventbus.Bus) *DailyReminderCheck {
	return &DailyReminderCheck{
		triggerService: triggerService,
		bus:            bus,
	}
}

// Name returns the name of this job
func (j *DailyReminderCheck) Name() string {
	return "DailyReminderCheck"
}

// Run executes the reminder check
func (j *DailyReminderCheck) Run(ctx context.Context) error {
	log.Println("🔍 [DailyReminderCheck] Starting daily reminder check...")

	// Find all REMINDER triggers for today (service handles business logic)
	triggers, err := j.triggerService.FindReminderTriggersForToday()
	if err != nil {
		log.Printf("❌ [DailyReminderCheck] Error finding reminder triggers: %v", err)
		return err
	}

	if len(triggers) == 0 {
		log.Println("ℹ️ [DailyReminderCheck] No reminder triggers found for today")
		return nil
	}

	log.Printf("📊 [DailyReminderCheck] Found %d reminder trigger(s) for today", len(triggers))

	// Publish event for each trigger
	for _, trigger := range triggers {
		// Publish event for reminder trigger
		event := eventbus.Event{
			Type: eventbus.EventReminderTrigger,
			Payload: map[string]any{
				"triggerId":   trigger.ID,
				"triggerCode": trigger.TriggerCode,
				"executeAt":   trigger.ExecuteAt,
				"config":      trigger.Config,
				"stepId":      trigger.StepID,
				"createdBy":   trigger.CreatedBy,
				"order":       trigger.Order,
			},
		}

		j.bus.Publish(event)
		if trigger.ExecuteAt != nil {
			log.Printf("📤 [DailyReminderCheck] Published EventReminderTrigger for trigger: %s (executeAt: %s)",
				trigger.ID, *trigger.ExecuteAt)
		} else {
			log.Printf("📤 [DailyReminderCheck] Published EventReminderTrigger for trigger: %s", trigger.ID)
		}
	}

	log.Println("✅ [DailyReminderCheck] Daily check completed")
	return nil
}
