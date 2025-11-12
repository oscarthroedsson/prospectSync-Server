package models

// === ENUMS ===
type WebhookStatus string
type WebhookEvent string
type WebhookType string

// Status
const (
	StatusStarted WebhookStatus = "started"
	StatusRunning WebhookStatus = "running"
	StatusSuccess WebhookStatus = "success"
	StatusError   WebhookStatus = "error"
)

// Event
const (
	EventScan    WebhookEvent = "scan"
	EventAnalyze WebhookEvent = "analyze"
)

// Type
const (
	TypePDF        WebhookType = "pdf"
	TypeJobPosting WebhookType = "job-posting"
	TypeRepo       WebhookType = "repo"
	TypeResume     WebhookType = "resume"
)

// === PAYLOAD ===
type WebhookPayload struct {
	Status    WebhookStatus `json:"status"`
	Event     WebhookEvent  `json:"event"`
	Type      WebhookType   `json:"type"`
	Data      any           `json:"data,omitempty"`
	Error     string        `json:"error,omitempty"`
	Message   string        `json:"message,omitempty"`
	Timestamp string        `json:"timestamp"`
}
