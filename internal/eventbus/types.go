package eventbus

type EventType string

const (
	EventApplicationCreated      EventType = "application.created"
	EventApplicationStageChanged EventType = "application.stage_changed"
	EventApplicationRejected     EventType = "application.rejected"
	EventApplicationHired        EventType = "application.hired"
)

type Event struct {
	Type    EventType
	Payload any
}
