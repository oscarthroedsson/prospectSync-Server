package server

import (
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"

	_ "github.com/joho/godotenv/autoload"

	"prospectsync-server/internal/database"
)

type Server struct {
	port int
	db   database.Service
}

func NewServer() *http.Server {
	PORT := os.Getenv("PORTCODE")
	fmt.Println("PORT: ", PORT)
	port, err := strconv.Atoi(PORT)

	if err != nil {
		fmt.Printf("Fel vid konvertering: %v\n", err)
		port = 8080 // Fallback port
	}

	NewServer := &Server{
		port: port,
		// db:   database.New(),
	}

	// Declare Server config
	server := &http.Server{
		Addr:         fmt.Sprintf(":%d", NewServer.port),
		Handler:      NewServer.RegisterRoutes(),
		IdleTimeout:  time.Minute,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	return server
}
