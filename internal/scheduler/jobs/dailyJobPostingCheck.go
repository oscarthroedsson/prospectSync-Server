package jobs

import (
	"context"
	"log"

	"prospectsync-server/internal/db/repositories"
	"prospectsync-server/internal/eventbus"
)

// DailyJobPostingCheck is a scheduled job that checks for expiring and expired job postings
// and publishes events to the event bus
type DailyJobPostingCheck struct {
	repo      *repositories.JobPostingRepository
	bus       *eventbus.Bus
	daysAhead int // Number of days ahead to check for expiring jobs (default: 3)
}

// NewDailyJobPostingCheck creates a new daily job posting check job
func NewDailyJobPostingCheck(repo *repositories.JobPostingRepository, bus *eventbus.Bus) *DailyJobPostingCheck {
	return &DailyJobPostingCheck{
		repo:      repo,
		bus:       bus,
		daysAhead: 3, // Default: check for jobs expiring in the next 3 days
	}
}

// Name returns the name of this job
func (j *DailyJobPostingCheck) Name() string {
	return "DailyJobPostingCheck"
}

// Run executes the job posting check
func (j *DailyJobPostingCheck) Run(ctx context.Context) error {
	log.Println("🔍 [DailyJobPostingCheck] Starting daily job posting check...")

	// Check for expired job postings
	if err := j.checkExpired(ctx); err != nil {
		log.Printf("❌ [DailyJobPostingCheck] Error checking expired jobs: %v", err)
		// Continue to check expiring jobs even if expired check fails
	}

	// Check for job postings expiring soon
	if err := j.checkExpiringSoon(ctx); err != nil {
		log.Printf("❌ [DailyJobPostingCheck] Error checking expiring jobs: %v", err)
		return err
	}

	log.Println("✅ [DailyJobPostingCheck] Daily check completed")
	return nil
}

// checkExpired finds and publishes events for expired job postings
func (j *DailyJobPostingCheck) checkExpired(ctx context.Context) error {
	expiredJobs, err := j.repo.FindExpired()
	if err != nil {
		return err
	}

	log.Printf("📊 [DailyJobPostingCheck] Found %d expired job posting(s)", len(expiredJobs))

	for _, job := range expiredJobs {
		if job.Id == nil {
			continue
		}

		// Publish event for expired job posting
		event := eventbus.Event{
			Type: eventbus.EventJobPostingExpired,
			Payload: map[string]any{
				"jobId":       *job.Id,
				"title":       job.Title,
				"companyName": job.CompanyName,
				"endsAt":      job.EndsAt,
				"url":         job.JobPostingUrl,
			},
		}

		j.bus.Publish(event)
		log.Printf("📤 [DailyJobPostingCheck] Published EventJobPostingExpired for job: %s", *job.Id)
	}

	return nil
}

// checkExpiringSoon finds and publishes events for job postings expiring soon
func (j *DailyJobPostingCheck) checkExpiringSoon(ctx context.Context) error {
	expiringJobs, err := j.repo.FindExpiringSoon(j.daysAhead)
	if err != nil {
		return err
	}

	log.Printf("📊 [DailyJobPostingCheck] Found %d job posting(s) expiring within %d days",
		len(expiringJobs), j.daysAhead)

	for _, job := range expiringJobs {
		if job.Id == nil {
			continue
		}

		// Publish event for expiring job posting
		event := eventbus.Event{
			Type: eventbus.EventJobPostingExpiringSoon,
			Payload: map[string]any{
				"jobId":       *job.Id,
				"title":       job.Title,
				"companyName": job.CompanyName,
				"endsAt":      job.EndsAt,
				"url":         job.JobPostingUrl,
			},
		}

		j.bus.Publish(event)
		log.Printf("📤 [DailyJobPostingCheck] Published EventJobPostingExpiringSoon for job: %s", *job.Id)
	}

	return nil
}
