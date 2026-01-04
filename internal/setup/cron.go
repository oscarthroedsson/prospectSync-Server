package setup

import (
	"log"

	"prospectsync-server/internal/db/repositories"
	"prospectsync-server/internal/eventbus"
	"prospectsync-server/internal/scheduler"
	"prospectsync-server/internal/scheduler/jobs"
	"prospectsync-server/internal/service/trigger"
)

// SetupCronJobs initializes and adds all cron jobs to the scheduler
// This function separates cron job setup from the main function
func SetupCronJobs(sched *scheduler.Scheduler, bus *eventbus.Bus) {
	log.Println("🔧 [Setup] Initializing cron jobs...")

	// Setup daily job posting check
	jobRepo := repositories.Methods()
	dailyJobPostingCheck := jobs.NewDailyJobPostingCheck(jobRepo, bus)
	sched.AddJob(dailyJobPostingCheck)
	log.Println("✅ [Setup] Daily job posting check job added")

	// Setup daily reminder check (using service layer)
	triggerRepo := repositories.TriggerMethods()
	triggerService := trigger.NewService(triggerRepo)
	dailyReminderCheck := jobs.NewDailyReminderCheck(triggerService, bus)
	sched.AddJob(dailyReminderCheck)
	log.Println("✅ [Setup] Daily reminder check job added")

	log.Println("✅ [Setup] All cron jobs initialized")
}
