package action

import (
	"log"

	"prospectsync-server/internal/models"
)

// executeCreateTask handles CREATE_TASK action
func (e *Executor) executeCreateTask(action *models.ActionDefinition) error {
	config := action.Config

	title, _ := config["title"].(string)
	datetime, _ := config["datetime"].(string)
	assignee, _ := config["assignee"].(string)

	log.Printf("✅ [ActionExecutor] CREATE_TASK - Title: %s, Due: %s, Assignee: %s",
		title, datetime, assignee)

	// TODO: Implement actual task creation
	// - Create task in task management system
	// - Set due date if datetime is provided
	// - Assign to user based on assignee enum

	return nil
}
