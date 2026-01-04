package listeners

import (
	"log"

	"prospectsync-server/internal/db/repositories"
	"prospectsync-server/internal/eventbus"
	"prospectsync-server/internal/service/action"
	"prospectsync-server/internal/service/step"
)

// StartAll initializes and starts all event listeners
func StartAll(bus *eventbus.Bus) {
	// Register all listeners here
	JobPostingListener(bus)
	ReminderListener(bus)
}

// JobPostingListener handles events related to job postings
// This listener subscribes to job posting expiration events
func JobPostingListener(bus *eventbus.Bus) {
	// Listen for job postings that are expiring soon (within 3 days)
	bus.Subscribe(eventbus.EventJobPostingExpiringSoon, func(e eventbus.Event) {
		payload, ok := e.Payload.(map[string]any)
		if !ok {
			log.Printf("❌ [JobPostingListener] Invalid payload for EventJobPostingExpiringSoon: %v", e.Payload)
			return
		}

		jobID, _ := payload["jobId"].(string)
		title, _ := payload["title"].(string)
		companyName, _ := payload["companyName"].(string)
		endsAt, _ := payload["endsAt"].(string)

		log.Printf("⚠️ [JobPostingListener] Job posting expiring soon - ID: %s, Title: %s, Company: %s, EndsAt: %s",
			jobID, title, companyName, endsAt)

		// TODO: Add your business logic here, e.g.:
		// - Send notification to users who saved this job
		// - Update status in database
		// - Send email alerts
	})

	// Listen for job postings that have expired
	bus.Subscribe(eventbus.EventJobPostingExpired, func(e eventbus.Event) {
		payload, ok := e.Payload.(map[string]any)
		if !ok {
			log.Printf("❌ [JobPostingListener] Invalid payload for EventJobPostingExpired: %v", e.Payload)
			return
		}

		jobID, _ := payload["jobId"].(string)
		title, _ := payload["title"].(string)
		companyName, _ := payload["companyName"].(string)

		log.Printf("🔴 [JobPostingListener] Job posting expired - ID: %s, Title: %s, Company: %s",
			jobID, title, companyName)

		// TODO: Add your business logic here, e.g.:
		// - Mark job posting as expired in database
		// - Notify users that the job is no longer available
		// - Archive the job posting
	})
}

// ReminderListener handles REMINDER trigger events
// This listener subscribes to reminder trigger events that are fired when a REMINDER trigger
// should execute today (based on executeAt matching today's date)
// When a trigger matches, it fetches the associated step and executes all actions in order
func ReminderListener(bus *eventbus.Bus) {
	stepRepo := repositories.StepMethods()
	stepService := step.NewService(stepRepo)
	actionExecutor := action.NewExecutor()

	bus.Subscribe(eventbus.EventReminderTrigger, func(e eventbus.Event) {
		payload, ok := e.Payload.(map[string]any)
		if !ok {
			log.Printf("❌ [ReminderListener] Invalid payload for EventReminderTrigger: %v", e.Payload)
			return
		}

		triggerID, _ := payload["triggerId"].(string)
		triggerCode, _ := payload["triggerCode"].(string)
		executeAt, _ := payload["executeAt"].(string)
		config, _ := payload["config"].(map[string]any)
		stepID, _ := payload["stepId"].(string)
		createdBy, _ := payload["createdBy"].(string)

		log.Printf("⏰ [ReminderListener] Reminder trigger fired - ID: %s, Code: %s, ExecuteAt: %s, StepID: %s, CreatedBy: %s",
			triggerID, triggerCode, executeAt, stepID, createdBy)

		// Extract config values (based on ReminderConfig schema)
		label, _ := config["label"].(string)
		description, _ := config["description"].(string)
		to, _ := config["to"].(string)
		from, _ := config["from"].(string)

		log.Printf("📋 [ReminderListener] Config - Label: %s, Description: %s, To: %s, From: %s",
			label, description, to, from)

		// If stepID is present, fetch step with actions and execute them
		if stepID != "" {
			log.Printf("🔍 [ReminderListener] Fetching step %s with actions...", stepID)

			step, err := stepService.GetStepWithActions(stepID)
			if err != nil {
				log.Printf("❌ [ReminderListener] Failed to fetch step %s: %v", stepID, err)
				return
			}

			if step == nil {
				log.Printf("⚠️ [ReminderListener] Step %s not found", stepID)
				return
			}

			log.Printf("✅ [ReminderListener] Step found - Name: %s, Status: %s, Actions: %d",
				step.Name, step.Status, len(step.Actions))

			// Execute all actions in order
			if len(step.Actions) > 0 {
				log.Printf("🚀 [ReminderListener] Executing %d action(s) for step %s", len(step.Actions), stepID)
				if err := actionExecutor.ExecuteActions(step.Actions); err != nil {
					log.Printf("❌ [ReminderListener] Error executing actions: %v", err)
				} else {
					log.Printf("✅ [ReminderListener] All actions executed successfully for step %s", stepID)
				}
			} else {
				log.Printf("ℹ️ [ReminderListener] No actions found for step %s", stepID)
			}
		} else {
			log.Printf("ℹ️ [ReminderListener] No stepId provided, skipping action execution")
		}

		// TODO: Additional business logic:
		// - Check conditions if any (combinator, conditions array)
		// - Handle expiration if present
		// - Send notifications to the process owner
		// - Log the reminder execution for audit
	})
}
