package step

import (
	"encoding/json"
	"log"

	"prospectsync-server/internal/db/repositories"
	"prospectsync-server/internal/models"
)

// Service handles business logic for process steps
type Service struct {
	stepRepo *repositories.StepRepository
}

// NewService creates a new step service
func NewService(stepRepo *repositories.StepRepository) *Service {
	return &Service{
		stepRepo: stepRepo,
	}
}

// GetStepWithActions retrieves a process step by ID along with all its actions
// This service method handles validation, JSON parsing, and business logic
func (s *Service) GetStepWithActions(stepID string) (*models.ProcessStep, error) {
	if stepID == "" {
		log.Printf("⚠️ [StepService] Empty stepID provided")
		return nil, nil
	}

	// Repository only does the query, service handles the logic
	step, err := s.stepRepo.GetStepByID(stepID)
	if err != nil {
		log.Printf("❌ [StepService] Failed to get step %s: %v", stepID, err)
		return nil, err
	}

	if step == nil {
		log.Printf("ℹ️ [StepService] Step %s not found", stepID)
		return nil, nil
	}

	// Get actions for this step
	actions, err := s.stepRepo.GetActionsByStepID(stepID)
	if err != nil {
		log.Printf("❌ [StepService] Failed to get actions for step %s: %v", stepID, err)
		return nil, err
	}

	// Parse JSON config for each action (service handles parsing)
	for _, action := range actions {
		if rawJSON, ok := action.Config["_raw"].([]byte); ok {
			delete(action.Config, "_raw")
			if len(rawJSON) > 0 {
				if err := json.Unmarshal(rawJSON, &action.Config); err != nil {
					log.Printf("⚠️ [StepService] Failed to parse config for action %s: %v", action.ID, err)
					action.Config = make(map[string]interface{})
				}
			}
		}
	}

	step.Actions = actions
	return step, nil
}
