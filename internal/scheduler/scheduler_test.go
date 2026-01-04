package scheduler

import (
	"context"
	"errors"
	"sync"
	"testing"
	"time"
)

// mockJob is a test implementation of the Job interface
type mockJob struct {
	name       string
	runCount   int
	runErrors  []error
	mu         sync.Mutex
	shouldFail bool
	runDelay   time.Duration
	onRun      func() error
}

func newMockJob(name string) *mockJob {
	return &mockJob{
		name:      name,
		runErrors: make([]error, 0),
	}
}

func (m *mockJob) Name() string {
	return m.name
}

func (m *mockJob) Run(ctx context.Context) error {
	m.mu.Lock()
	m.runCount++
	m.mu.Unlock()

	if m.runDelay > 0 {
		time.Sleep(m.runDelay)
	}

	if m.onRun != nil {
		return m.onRun()
	}

	if m.shouldFail {
		err := errors.New("mock job failed")
		m.mu.Lock()
		m.runErrors = append(m.runErrors, err)
		m.mu.Unlock()
		return err
	}

	return nil
}

func (m *mockJob) GetRunCount() int {
	m.mu.Lock()
	defer m.mu.Unlock()
	return m.runCount
}

func TestScheduler_AddJob(t *testing.T) {
	sched := NewScheduler()
	job := newMockJob("test-job")

	sched.AddJob(job)

	if len(sched.jobs) != 1 {
		t.Errorf("Expected 1 job, got %d", len(sched.jobs))
	}

	if sched.jobs[0].Name() != "test-job" {
		t.Errorf("Expected job name 'test-job', got '%s'", sched.jobs[0].Name())
	}
}

func TestScheduler_Start(t *testing.T) {
	sched := NewScheduler()
	job := newMockJob("test-job")
	sched.AddJob(job)

	// Start scheduler
	sched.Start()

	// Wait a bit for the job to run
	time.Sleep(100 * time.Millisecond)

	// Stop scheduler
	sched.Stop()

	// Check that job ran at least once (immediately on start)
	runCount := job.GetRunCount()
	if runCount < 1 {
		t.Errorf("Expected job to run at least once, got %d runs", runCount)
	}
}

func TestScheduler_Stop(t *testing.T) {
	sched := NewScheduler()
	job := newMockJob("test-job")
	sched.AddJob(job)

	sched.Start()
	time.Sleep(50 * time.Millisecond)

	// Stop should be idempotent
	sched.Stop()
	sched.Stop()

	if !sched.stopped {
		t.Error("Expected scheduler to be stopped")
	}
}

func TestScheduler_JobFailure(t *testing.T) {
	sched := NewScheduler()
	job := newMockJob("failing-job")
	job.shouldFail = true
	sched.AddJob(job)

	sched.Start()
	time.Sleep(100 * time.Millisecond)
	sched.Stop()

	// Job should still have run despite failure
	runCount := job.GetRunCount()
	if runCount < 1 {
		t.Errorf("Expected job to run despite failure, got %d runs", runCount)
	}
}

func TestScheduler_ContextCancellation(t *testing.T) {
	sched := NewScheduler()
	job := newMockJob("test-job")
	sched.AddJob(job)

	sched.Start()
	time.Sleep(50 * time.Millisecond)

	// Cancel context
	sched.cancel()
	time.Sleep(50 * time.Millisecond)

	// Check that context is cancelled
	select {
	case <-sched.ctx.Done():
		// Expected
	default:
		t.Error("Expected context to be cancelled")
	}
}

func TestScheduler_MultipleJobs(t *testing.T) {
	sched := NewScheduler()
	job1 := newMockJob("job-1")
	job2 := newMockJob("job-2")
	job3 := newMockJob("job-3")

	sched.AddJob(job1)
	sched.AddJob(job2)
	sched.AddJob(job3)

	sched.Start()
	time.Sleep(100 * time.Millisecond)
	sched.Stop()

	// All jobs should have run
	if job1.GetRunCount() < 1 {
		t.Error("Expected job1 to run")
	}
	if job2.GetRunCount() < 1 {
		t.Error("Expected job2 to run")
	}
	if job3.GetRunCount() < 1 {
		t.Error("Expected job3 to run")
	}
}
