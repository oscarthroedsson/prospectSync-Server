package models

// ActionDefinition represents an action definition from the database
type ActionDefinition struct {
	ID       string                 `json:"id"`
	StepID   string                 `json:"stepId"`
	Name     string                 `json:"name"`
	IsPublic bool                   `json:"isPublic"`
	Order    int                    `json:"order"`
	Config   map[string]interface{} `json:"config"` // JSON config with discriminated union
}

// ProcessStep represents a process step from the database
type ProcessStep struct {
	ID        string                 `json:"id"`
	ProcessID *string                `json:"processId"` // nullable
	Name      string                 `json:"name"`
	Status    string                 `json:"status"` // e.g., "completed", "skipped", "in_progress", "failed"
	Order     int                    `json:"order"`
	Actions   []*ActionDefinition    `json:"actions,omitempty"`
	Metadata  map[string]interface{} `json:"metadata,omitempty"`
}

// ActionConfigType represents the type of action config
type ActionConfigType string

const (
	ActionTypeSendEmail           ActionConfigType = "SEND_EMAIL"
	ActionTypeCreateCalendarEvent ActionConfigType = "CREATE_CALENDAR_EVENT"
	ActionTypeCreateTask          ActionConfigType = "CREATE_TASK"
	ActionTypeWebhook             ActionConfigType = "WEBHOOK"
	ActionTypeCallReminder        ActionConfigType = "CALL_REMINDER"
	ActionTypeUpdateStepStatus    ActionConfigType = "UPDATE_STEP_STATUS"
)
