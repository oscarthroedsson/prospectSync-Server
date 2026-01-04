package models

// TriggerDefinition represents a trigger definition from the database
type TriggerDefinition struct {
	ID          string                 `json:"id"`
	Order       int                    `json:"order"`
	IsPublic    bool                   `json:"isPublic"`
	CreatedBy   string                 `json:"createdBy"`
	TriggerCode string                 `json:"triggerCode"` // e.g., "REMINDER", "EMAIL_SENT", etc.
	ExecuteWhen *string                `json:"executeWhen"` // e.g., "time", "event" (nullable)
	ExecuteAt   *string                `json:"executeAt"`   // ISO date string (nullable)
	Combinator  *string                `json:"combinator"`  // nullable
	Config      map[string]interface{} `json:"config"`      // JSON config
	Expiration  *string                `json:"expiration"`  // nullable
	StepID      *string                `json:"stepId"`      // nullable
}
