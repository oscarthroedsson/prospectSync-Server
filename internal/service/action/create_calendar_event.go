package action

import (
	"log"

	"prospectsync-server/internal/models"
)

// executeCreateCalendarEvent handles CREATE_CALENDAR_EVENT action
func (e *Executor) executeCreateCalendarEvent(action *models.ActionDefinition) error {
	config := action.Config

	title, _ := config["title"].(string)
	start, _ := config["start"].(string)
	durationMinutes, _ := config["durationMinutes"].(float64)
	_ = config["description"] // Will be used when implementing calendar event creation
	_ = config["location"]    // Will be used when implementing calendar event creation

	log.Printf("📅 [ActionExecutor] CREATE_CALENDAR_EVENT - Title: %s, Start: %s, Duration: %.0f min",
		title, start, durationMinutes)

	// TODO: Implement actual calendar event creation
	// - Parse start time and duration
	// - Create event in Google Calendar (or other calendar service)
	// - Handle attendees, colorId, calendarId if present

	return nil
}
