package trigger

import (
	"encoding/json"
	"log"
	"time"

	"prospectsync-server/internal/db/repositories"
	"prospectsync-server/internal/models"
)

// Service handles business logic for triggers
type Service struct {
	triggerRepo *repositories.TriggerRepository
}

// NewService creates a new trigger service
func NewService(triggerRepo *repositories.TriggerRepository) *Service {
	return &Service{
		triggerRepo: triggerRepo,
	}
}

// FindReminderTriggersForToday finds all REMINDER triggers that should execute today
// This service method handles date calculation, JSON parsing, and business logic
func (s *Service) FindReminderTriggersForToday() ([]*models.TriggerDefinition, error) {
	// Calculate today's date for query
	today := time.Now()
	todayDateStr := today.Format("2006-01-02")

	// Repository only does the query
	triggers, err := s.triggerRepo.FindReminderTriggersByDate(todayDateStr)
	if err != nil {
		log.Printf("❌ [TriggerService] Failed to find reminder triggers: %v", err)
		return nil, err
	}

	// Parse JSON config for each trigger (service handles parsing)
	for _, trigger := range triggers {
		if rawJSON, ok := trigger.Config["_raw"].([]byte); ok {
			delete(trigger.Config, "_raw")
			if len(rawJSON) > 0 {
				if err := json.Unmarshal(rawJSON, &trigger.Config); err != nil {
					log.Printf("⚠️ [TriggerService] Failed to parse config for trigger %s: %v", trigger.ID, err)
					trigger.Config = make(map[string]interface{})
				}
			}
		}
	}

	log.Printf("📊 [TriggerService] Found %d reminder trigger(s) for today", len(triggers))
	return triggers, nil
}
