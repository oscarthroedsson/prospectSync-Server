package mapper

import (
	"encoding/json"
	"fmt"
	"time"

	"prospectsync-server/internal/models"
)

func JobPostingMapper(data []byte, url string, createdById *string) (*models.JobPosting, error) {
	var jobPosting *models.JobPosting

	// Försök unmarshela JSON
	if err := json.Unmarshal(data, &jobPosting); err != nil {
		return nil, fmt.Errorf("kunde inte tolka JSON: %w", err)
	}

	// Fyll på obligatoriska fält
	today := time.Now()
	jobPosting.JobPostingUrl = url
	jobPosting.CreatedAt = today.Format(time.RFC3339)
	jobPosting.UpdatedAt = today.Format(time.RFC3339)
	jobPosting.CreatedJobPosting = models.CreatedJobPosting{
		CreatedByType: "system",
		CreatedById:   createdById,
		Source:        Ptr("url"),
		ImportedAt:    Ptr(today.Format(time.RFC3339)),
	}

	return jobPosting, nil
}

// Ptr är en enkel helper för *string
func Ptr(s string) *string {
	return &s
}
