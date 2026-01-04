package eventbus

type EventType string

const (
	// Application events
	EventApplicationCreated      EventType = "application.created"
	EventApplicationStageChanged EventType = "application.stage_changed"
	EventApplicationRejected     EventType = "application.rejected"
	EventApplicationHired        EventType = "application.hired"

	// Job posting events
	EventJobPostingExpiringSoon EventType = "job_posting.expiring_soon"
	EventJobPostingExpired      EventType = "job_posting.expired"

	// Trigger events
	EventReminderTrigger EventType = "trigger.reminder"
)

// Event represents a single event in the event bus
type Event struct {
	Type    EventType // The type of event
	Payload any       // The event payload (can be any type)
}
