package config

import (
	"log"
	"os"
)

type PostgresConfig struct {
	URL string
}

func LoadPostgresConfig() *PostgresConfig {
	url := os.Getenv("DATABASE_URL")
	if url == "" {
		log.Fatal("DATABASE_URL must be set")
	}

	return &PostgresConfig{
		URL: url,
	}
}
