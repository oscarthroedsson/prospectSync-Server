package email

import (
	"context"
	"log"
	"os"
	"sync"
	"time"

	"github.com/mailersend/mailersend-go"
)

// EmailType represents the type of email to send
type EmailType string

// Service handles email sending via MailerSend
type Service struct {
	client *mailersend.Mailersend
}

var (
	instance *Service
	once     sync.Once
)

// GetService returns the singleton instance of the email service
func GetService() *Service {
	once.Do(func() {
		apiKey := os.Getenv("MAILERSEND_API_TOKEN")
		if apiKey == "" {
			log.Println("⚠️ [EmailService] MAILERSEND_API_KEY not set")
			// Create instance anyway but client will be nil
			instance = &Service{
				client: nil,
			}
			return
		}

		// Initialize MailerSend client
		client := mailersend.NewMailersend(apiKey)

		instance = &Service{
			client: client,
		}
		log.Println("✅ [EmailService] Email service initialized")
	})
	return instance
}

// SendEmail sends an email based on the email type
func (s *Service) SendEmail(emailType EmailType, data map[string]interface{}) error {
	if s.client == nil {
		return logError("MailerSend client not initialized - check MAILERSEND_API_KEY")
	}

	log.Printf("📧 [EmailService] Sending email type: %s", emailType)

	// Extract email data from map
	toEmail, _ := data["to"].(string)
	toName, _ := data["toName"].(string)
	fromEmail, _ := data["from"].(string)
	fromName, _ := data["fromName"].(string)
	subject, _ := data["subject"].(string)
	htmlContent, _ := data["html"].(string)
	textContent, _ := data["text"].(string)

	// Validate required fields
	if toEmail == "" {
		return logError("recipient email (to) is required")
	}
	if subject == "" {
		return logError("subject is required")
	}
	if htmlContent == "" && textContent == "" {
		return logError("either html or text content is required")
	}

	// Set default from if not provided
	if fromEmail == "" {
		fromEmail = os.Getenv("MAILERSEND_FROM_EMAIL")
		if fromEmail == "" {
			return logError("sender email (from) is required")
		}
	}
	if fromName == "" {
		fromName = os.Getenv("MAILERSEND_FROM_NAME")
	}

	// Create email context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Create new message
	message := s.client.Email.NewMessage()

	// Set from
	from := mailersend.From{
		Name:  fromName,
		Email: fromEmail,
	}
	message.SetFrom(from)

	// Set recipients
	recipients := []mailersend.Recipient{
		{
			Name:  toName,
			Email: toEmail,
		},
	}
	message.SetRecipients(recipients)

	// Set subject
	message.SetSubject(subject)

	// Set content (prefer HTML over text)
	if htmlContent != "" {
		message.SetHTML(htmlContent)
	}
	if textContent != "" {
		message.SetText(textContent)
	}

	// Send email
	_, err := s.client.Email.Send(ctx, message)
	if err != nil {
		log.Printf("❌ [EmailService] Failed to send email: %v", err)
		return err
	}

	log.Printf("✅ [EmailService] Email sent successfully to %s", toEmail)
	return nil
}

// logError logs an error and returns it
func logError(msg string) error {
	log.Printf("❌ [EmailService] %s", msg)
	return &EmailError{Message: msg}
}

// EmailError represents an email service error
type EmailError struct {
	Message string
}

func (e *EmailError) Error() string {
	return e.Message
}
