package action

import (
	"log"

	"prospectsync-server/internal/models"
)

// Executor handles execution of different action types
type Executor struct {
	// Future: Add dependencies like email service, calendar service, etc.
}

// NewExecutor creates a new action executor
func NewExecutor() *Executor {
	return &Executor{}
}

// ExecuteAction executes a single action based on its config type
func (e *Executor) ExecuteAction(action *models.ActionDefinition) error {
	if len(action.Config) == 0 {
		log.Printf("⚠️ [ActionExecutor] Action %s has no config, skipping", action.ID)
		return nil
	}

	// Extract action type from config
	actionType, ok := action.Config["type"].(string)
	if !ok {
		log.Printf("⚠️ [ActionExecutor] Action %s has no type in config, skipping", action.ID)
		return nil
	}

	log.Printf("🚀 [ActionExecutor] Executing action %s (type: %s)", action.ID, actionType)

	switch models.ActionConfigType(actionType) {
	case models.ActionTypeSendEmail:
		return e.executeSendEmail(action)
	case models.ActionTypeCreateCalendarEvent:
		return e.executeCreateCalendarEvent(action)
	case models.ActionTypeCreateTask:
		return e.executeCreateTask(action)
	case models.ActionTypeWebhook:
		return e.executeWebhook(action)
	case models.ActionTypeCallReminder:
		return e.executeCallReminder(action)
	case models.ActionTypeUpdateStepStatus:
		return e.executeUpdateStepStatus(action)
	default:
		log.Printf("⚠️ [ActionExecutor] Unknown action type: %s", actionType)
		return nil
	}
}

// ExecuteActions executes multiple actions in order
func (e *Executor) ExecuteActions(actions []*models.ActionDefinition) error {
	for _, action := range actions {
		if err := e.ExecuteAction(action); err != nil {
			log.Printf("❌ [ActionExecutor] Failed to execute action %s: %v", action.ID, err)
			// Continue with next action even if one fails
		}
	}
	return nil
}
