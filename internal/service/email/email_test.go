package email

import (
	"os"
	"testing"
)

// TestSendEmail_RealEmail tests sending a real email to oscar.throedsson@gmail.com
// This is an integration test that requires MAILERSEND_API_KEY to be set
// To run: go test -v -run TestSendEmail_RealEmail ./internal/service/email
func TestSendEmail_RealEmail(t *testing.T) {
	// Skip test if API key is not set
	apiKey := os.Getenv("MAILERSEND_API_TOKEN")
	if apiKey == "" {
		t.Skip("Skipping test: MAILERSEND_API_KEY not set")
	}

	// Get email service instance
	service := GetService()

	// Test data
	// Note: You need to set a verified sender email in MailerSend
	// For now, we'll use the from email from env or a placeholder
	fromEmail := os.Getenv("MAILERSEND_FROM_EMAIL")
	if fromEmail == "" {
		// You'll need to set this to a verified email in your MailerSend account
		fromEmail = "noreply@yourdomain.com" // Replace with your verified sender
	}

	// Use a test email on the verified domain, or gmail if account allows external domains
	testToEmail := os.Getenv("MAILERSEND_TEST_TO_EMAIL")
	if testToEmail == "" {
		testToEmail = "oscar.throedsson@gmail.com" // Default fallback
	}

	testData := map[string]interface{}{
		"to":       testToEmail,
		"toName":   "Oscar Throedsson",
		"from":     fromEmail,
		"fromName": "ProspectSync Server",
		"subject":  "Test Email from ProspectSync Server",
		"html": `
			<html>
				<body>
					<h1>Test Email</h1>
					<p>This is a test email sent from the ProspectSync Server email service.</p>
					<p>If you received this email, the MailerSend integration is working correctly!</p>
				</body>
			</html>
		`,
		"text": "Test Email\n\nThis is a test email sent from the ProspectSync Server email service.\n\nIf you received this email, the MailerSend integration is working correctly!",
	}

	// Send email
	err := service.SendEmail(EmailType("TEST"), testData)
	if err != nil {
		t.Fatalf("Failed to send email: %v", err)
	}

	t.Log("✅ Email sent successfully to oscar.throedsson@gmail.com")
}

// TestSendEmail_HTMLOnly tests sending an HTML-only email
func TestSendEmail_HTMLOnly(t *testing.T) {
	apiKey := os.Getenv("MAILERSEND_API_KEY")
	if apiKey == "" {
		t.Skip("Skipping test: MAILERSEND_API_KEY not set")
	}

	service := GetService()

	testData := map[string]interface{}{
		"to":      "oscar.throedsson@gmail.com",
		"toName":  "Oscar Throedsson",
		"subject": "HTML Only Test Email",
		"html":    "<h1>HTML Only Email</h1><p>This email contains only HTML content.</p>",
	}

	err := service.SendEmail(EmailType("HTML_TEST"), testData)
	if err != nil {
		t.Fatalf("Failed to send HTML-only email: %v", err)
	}

	t.Log("✅ HTML-only email sent successfully")
}

// TestSendEmail_TextOnly tests sending a text-only email
func TestSendEmail_TextOnly(t *testing.T) {
	apiKey := os.Getenv("MAILERSEND_API_KEY")
	if apiKey == "" {
		t.Skip("Skipping test: MAILERSEND_API_KEY not set")
	}

	service := GetService()

	testData := map[string]interface{}{
		"to":      "oscar.throedsson@gmail.com",
		"toName":  "Oscar Throedsson",
		"subject": "Text Only Test Email",
		"text":    "This is a plain text email. No HTML formatting here.",
	}

	err := service.SendEmail(EmailType("TEXT_TEST"), testData)
	if err != nil {
		t.Fatalf("Failed to send text-only email: %v", err)
	}

	t.Log("✅ Text-only email sent successfully")
}

// TestSendEmail_WithFrom tests sending an email with custom from address
func TestSendEmail_WithFrom(t *testing.T) {
	apiKey := os.Getenv("MAILERSEND_API_KEY")
	if apiKey == "" {
		t.Skip("Skipping test: MAILERSEND_API_KEY not set")
	}

	service := GetService()

	testData := map[string]interface{}{
		"to":       "oscar.throedsson@gmail.com",
		"toName":   "Oscar Throedsson",
		"from":     os.Getenv("MAILERSEND_FROM_EMAIL"), // Use env var or set explicitly
		"fromName": os.Getenv("MAILERSEND_FROM_NAME"),  // Use env var or set explicitly
		"subject":  "Custom From Address Test",
		"html":     "<p>This email has a custom from address.</p>",
	}

	err := service.SendEmail(EmailType("FROM_TEST"), testData)
	if err != nil {
		t.Fatalf("Failed to send email with custom from: %v", err)
	}

	t.Log("✅ Email with custom from address sent successfully")
}

// TestSendEmail_ValidationErrors tests that validation errors are returned
func TestSendEmail_ValidationErrors(t *testing.T) {
	apiKey := os.Getenv("MAILERSEND_API_KEY")
	if apiKey == "" {
		t.Skip("Skipping test: MAILERSEND_API_KEY not set")
	}

	service := GetService()

	// Test missing recipient
	testData := map[string]interface{}{
		"subject": "Test",
		"html":    "<p>Test</p>",
	}
	err := service.SendEmail(EmailType("TEST"), testData)
	if err == nil {
		t.Error("Expected error for missing recipient email")
	}

	// Test missing subject
	testData = map[string]interface{}{
		"to":   "oscar.throedsson@gmail.com",
		"html": "<p>Test</p>",
	}
	err = service.SendEmail(EmailType("TEST"), testData)
	if err == nil {
		t.Error("Expected error for missing subject")
	}

	// Test missing content
	testData = map[string]interface{}{
		"to":      "oscar.throedsson@gmail.com",
		"subject": "Test",
	}
	err = service.SendEmail(EmailType("TEST"), testData)
	if err == nil {
		t.Error("Expected error for missing content")
	}

	t.Log("✅ Validation error tests passed")
}

// TestGetService_Singleton tests that GetService returns a singleton
func TestGetService_Singleton(t *testing.T) {
	service1 := GetService()
	service2 := GetService()

	if service1 != service2 {
		t.Error("Expected GetService() to return the same instance (singleton)")
	}
}
