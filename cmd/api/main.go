package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os/signal"
	"syscall"
	"time"

	"github.com/joho/godotenv"

	"prospectsync-server/internal/config"
	"prospectsync-server/internal/db"
	"prospectsync-server/internal/eventbus"
	"prospectsync-server/internal/listeners"
	"prospectsync-server/internal/scheduler"
	"prospectsync-server/internal/server"
	"prospectsync-server/internal/setup"
)

func gracefulShutdown(apiServer *http.Server, sched *scheduler.Scheduler, done chan bool) {
	// Create context that listens for the interrupt signal from the OS.
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	// Listen for the interrupt signal.
	<-ctx.Done()

	log.Println("🛑 [Shutdown] Shutting down gracefully, press Ctrl+C again to force")
	stop() // Allow Ctrl+C to force shutdown

	// Stop scheduler first (gracefully stop all scheduled jobs)
	log.Println("🛑 [Shutdown] Stopping scheduler...")
	sched.Stop()

	// The context is used to inform the server it has 5 seconds to finish
	// the request it is currently handling
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := apiServer.Shutdown(ctx); err != nil {
		log.Printf("❌ [Shutdown] Server forced to shutdown with error: %v", err)
	}

	log.Println("✅ [Shutdown] Server exited")

	// Notify the main goroutine that the shutdown is complete
	done <- true
}

func main() {
	err := godotenv.Load("../../.env")
	if err != nil {
		log.Println("⚠️ [Main] .env file not found, using environment variables")
	}

	// Initialize database
	cfg := config.LoadConfig()
	db.InitDB(cfg.Postgres)

	// Initialize event bus
	bus := eventbus.Get()
	log.Println("✅ [Main] Event bus initialized")

	// Start all event listeners
	listeners.StartAll(bus)
	log.Println("✅ [Main] Event listeners started")

	// Setup and start cron jobs
	// Note: Listeners will be set up later when we implement webhook listeners
	sched := scheduler.NewScheduler()
	setup.SetupCronJobs(sched, bus)
	sched.Start()
	log.Println("✅ [Main] Scheduler started with all cron jobs")

	// Create HTTP server
	srv := server.NewServer()

	// Create a done channel to signal when the shutdown is complete
	done := make(chan bool, 1)

	// Run graceful shutdown in a separate goroutine
	go gracefulShutdown(srv, sched, done)

	// Start HTTP server
	log.Println("🚀 [Main] Starting HTTP server...")
	err = srv.ListenAndServe()
	if err != nil && err != http.ErrServerClosed {
		panic(fmt.Sprintf("http server error: %s", err))
	}

	// Wait for the graceful shutdown to complete
	<-done
	log.Println("✅ [Main] Graceful shutdown complete.")
}
