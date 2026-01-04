package scheduler

import (
	"context"
	"log"
	"sync"
	"time"
)

// Job represents a scheduled job that can be run periodically
type Job interface {
	// Name returns the name of the job for logging purposes
	Name() string
	// Run executes the job logic
	Run(ctx context.Context) error
}

// Scheduler manages and runs scheduled jobs
type Scheduler struct {
	jobs    []Job
	mu      sync.RWMutex
	ctx     context.Context
	cancel  context.CancelFunc
	wg      sync.WaitGroup
	stopped bool
}

// NewScheduler creates a new scheduler instance
func NewScheduler() *Scheduler {
	ctx, cancel := context.WithCancel(context.Background())
	return &Scheduler{
		jobs:    make([]Job, 0),
		ctx:     ctx,
		cancel:  cancel,
		stopped: false,
	}
}

// AddJob adds a job to the scheduler
func (s *Scheduler) AddJob(job Job) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.jobs = append(s.jobs, job)
}

// Start begins running all scheduled jobs
func (s *Scheduler) Start() {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.stopped {
		log.Println("⚠️ [Scheduler] Cannot start: scheduler is stopped")
		return
	}

	log.Printf("🚀 [Scheduler] Starting scheduler with %d job(s)", len(s.jobs))

	for _, job := range s.jobs {
		s.wg.Add(1)
		go s.runJob(job)
	}
}

// Stop gracefully stops all running jobs
func (s *Scheduler) Stop() {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.stopped {
		return
	}

	log.Println("🛑 [Scheduler] Stopping scheduler...")
	s.stopped = true
	s.cancel()

	// Wait for all jobs to finish (with timeout)
	done := make(chan struct{})
	go func() {
		s.wg.Wait()
		close(done)
	}()

	select {
	case <-done:
		log.Println("✅ [Scheduler] All jobs stopped gracefully")
	case <-time.After(30 * time.Second):
		log.Println("⚠️ [Scheduler] Timeout waiting for jobs to stop")
	}
}

// runJob runs a single job in a loop until the scheduler is stopped
func (s *Scheduler) runJob(job Job) {
	defer s.wg.Done()

	// Run immediately on start
	log.Printf("⏰ [Scheduler] Running job immediately: %s", job.Name())
	if err := job.Run(s.ctx); err != nil {
		log.Printf("❌ [Scheduler] Job %s failed: %v", job.Name(), err)
	}

	// Calculate time until next midnight
	now := time.Now()
	midnight := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	midnight = midnight.Add(24 * time.Hour) // Next midnight
	initialDelay := midnight.Sub(now)

	// Wait for initial delay until midnight
	select {
	case <-s.ctx.Done():
		log.Printf("🛑 [Scheduler] Job %s stopped before first scheduled run", job.Name())
		return
	case <-time.After(initialDelay):
		// First run at midnight
		log.Printf("⏰ [Scheduler] Running job at midnight: %s", job.Name())
		if err := job.Run(s.ctx); err != nil {
			log.Printf("❌ [Scheduler] Job %s failed: %v", job.Name(), err)
		}
	}

	// Then run every 24 hours
	ticker := time.NewTicker(24 * time.Hour)
	defer ticker.Stop()

	for {
		select {
		case <-s.ctx.Done():
			log.Printf("🛑 [Scheduler] Job %s stopped", job.Name())
			return
		case <-ticker.C:
			log.Printf("⏰ [Scheduler] Running job: %s", job.Name())
			if err := job.Run(s.ctx); err != nil {
				log.Printf("❌ [Scheduler] Job %s failed: %v", job.Name(), err)
			}
		}
	}
}
