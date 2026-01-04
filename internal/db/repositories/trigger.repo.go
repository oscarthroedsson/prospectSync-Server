package repositories

import (
	"context"
	"database/sql"

	"github.com/jackc/pgx/v5/pgxpool"

	"prospectsync-server/internal/db"
	"prospectsync-server/internal/models"
)

type TriggerRepository struct {
	pool *pgxpool.Pool
}

var triggerRepoInstance *TriggerRepository

// TriggerMethods returns the singleton instance of TriggerRepository
func TriggerMethods() *TriggerRepository {
	if triggerRepoInstance == nil {
		triggerRepoInstance = &TriggerRepository{
			pool: db.GetDB().Pool,
		}
	}
	return triggerRepoInstance
}

// FindReminderTriggersByDate finds all REMINDER triggers for a specific date (repository only does query)
// dateStr should be in YYYY-MM-DD format
func (r *TriggerRepository) FindReminderTriggersByDate(dateStr string) ([]*models.TriggerDefinition, error) {
	rows, err := r.pool.Query(context.Background(), `
		SELECT
			id,
			"order",
			"isPublic",
			"createdBy",
			"triggerCode",
			"executeWhen",
			"executeAt",
			combinator,
			config,
			expiration,
			"stepId"
		FROM trigger_definition
		WHERE "triggerCode" = 'REMINDER'
			AND "executeWhen" IS NULL
			AND "executeAt" IS NOT NULL
			AND DATE("executeAt"::timestamp) = DATE($1::timestamp)
		ORDER BY "executeAt" ASC
	`, dateStr)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var triggers []*models.TriggerDefinition
	for rows.Next() {
		var trigger models.TriggerDefinition
		var configJSON []byte
		var executeWhen sql.NullString
		var executeAt sql.NullString
		var combinator sql.NullString
		var expiration sql.NullString
		var stepID sql.NullString

		err := rows.Scan(
			&trigger.ID,
			&trigger.Order,
			&trigger.IsPublic,
			&trigger.CreatedBy,
			&trigger.TriggerCode,
			&executeWhen,
			&executeAt,
			&combinator,
			&configJSON,
			&expiration,
			&stepID,
		)
		if err != nil {
			return nil, err
		}

		// Handle nullable fields
		if executeWhen.Valid {
			trigger.ExecuteWhen = &executeWhen.String
		}
		if executeAt.Valid {
			trigger.ExecuteAt = &executeAt.String
		}
		if combinator.Valid {
			trigger.Combinator = &combinator.String
		}
		if expiration.Valid {
			trigger.Expiration = &expiration.String
		}
		if stepID.Valid {
			trigger.StepID = &stepID.String
		}

		// Repository only returns raw JSON, service will parse it
		trigger.Config = make(map[string]interface{})
		if len(configJSON) > 0 {
			// Store raw JSON bytes for service to parse
			trigger.Config["_raw"] = configJSON
		}

		triggers = append(triggers, &trigger)
	}

	return triggers, rows.Err()
}
