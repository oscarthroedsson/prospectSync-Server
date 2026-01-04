package repositories

import (
	"context"
	"database/sql"

	"github.com/jackc/pgx/v5/pgxpool"

	"prospectsync-server/internal/db"
	"prospectsync-server/internal/models"
)

type StepRepository struct {
	pool *pgxpool.Pool
}

var stepRepoInstance *StepRepository

// StepMethods returns the singleton instance of StepRepository
func StepMethods() *StepRepository {
	if stepRepoInstance == nil {
		stepRepoInstance = &StepRepository{
			pool: db.GetDB().Pool,
		}
	}
	return stepRepoInstance
}

// GetStepByID retrieves a process step by ID (repository only does query)
func (r *StepRepository) GetStepByID(stepID string) (*models.ProcessStep, error) {
	stepRow := r.pool.QueryRow(context.Background(), `
		SELECT
			id,
			"processId",
			name,
			status,
			"order"
		FROM process_step
		WHERE id = $1
	`, stepID)

	var step models.ProcessStep
	var processID sql.NullString

	err := stepRow.Scan(
		&step.ID,
		&processID,
		&step.Name,
		&step.Status,
		&step.Order,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	if processID.Valid {
		step.ProcessID = &processID.String
	}

	return &step, nil
}

// GetActionsByStepID retrieves all actions for a step (repository only does query)
func (r *StepRepository) GetActionsByStepID(stepID string) ([]*models.ActionDefinition, error) {
	actionRows, err := r.pool.Query(context.Background(), `
		SELECT
			id,
			"stepId",
			name,
			"isPublic",
			"order",
			config
		FROM action_definition
		WHERE "stepId" = $1
		ORDER BY "order" ASC
	`, stepID)
	if err != nil {
		return nil, err
	}
	defer actionRows.Close()

	var actions []*models.ActionDefinition
	for actionRows.Next() {
		var action models.ActionDefinition
		var configJSON []byte

		err := actionRows.Scan(
			&action.ID,
			&action.StepID,
			&action.Name,
			&action.IsPublic,
			&action.Order,
			&configJSON,
		)
		if err != nil {
			return nil, err
		}

		// Repository only returns raw JSON, service will parse it
		action.Config = make(map[string]interface{})
		if len(configJSON) > 0 {
			// Store raw JSON bytes for service to parse
			action.Config["_raw"] = configJSON
		}

		actions = append(actions, &action)
	}

	return actions, nil
}
