package action

import (
	"log"

	"prospectsync-server/internal/models"
)

// executeSendEmail handles SEND_EMAIL action
func (e *Executor) executeSendEmail(action *models.ActionDefinition) error {
	config := action.Config

	to, _ := config["to"].(string)
	subject, _ := config["subject"].(string)
	email, _ := config["email"].(string)
	_ = config["content"] // Will be used when implementing email sending

	log.Printf("📧 [ActionExecutor] SEND_EMAIL - To: %s, Email: %s, Subject: %s", to, email, subject)

	// TODO: Implement actual email sending logic
	// - Resolve recipient based on "to" enum (PROCESS_OWNER, COUNTERPART, etc.)
	// - Use email service to send email
	// - Handle template variables if present
	// - Handle attachments, CC, BCC, replyTo if present

	return nil
}
