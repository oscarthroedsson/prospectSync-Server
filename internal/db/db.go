package db

import (
	"context"
	"log"
	"sync"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"prospectsync-server/internal/config"
)

type DB struct {
	Pool *pgxpool.Pool
}

var (
	instance *DB
	once     sync.Once
)

// InitDB skapar anslutningen en gång
func InitDB(cfg *config.PostgresConfig) *DB {
	once.Do(func() {
		// Parsar pool-konfiguration från URL
		poolConfig, err := pgxpool.ParseConfig(cfg.URL)
		if err != nil {
			log.Fatalf("Unable to parse database URL: %v", err)
		}

		// Säkerställ att connections roteras ofta för att undvika stale prepared statements
		poolConfig.MaxConnLifetime = 0 // Connections återanvänds inte längre än detta
		poolConfig.MaxConnIdleTime = 0
		poolConfig.MaxConns = 10 // Anpassa efter behov

		// Inaktivera prepared statement cache för att undvika "already exists" errors
		poolConfig.ConnConfig.DefaultQueryExecMode = pgx.QueryExecModeSimpleProtocol

		// Skapa poolen
		pool, err := pgxpool.NewWithConfig(context.Background(), poolConfig)
		if err != nil {
			log.Fatalf("Unable to connect to database: %v", err)
		}

		instance = &DB{
			Pool: pool,
		}
	})
	return instance
}

// GetDB returnerar den redan skapade instansen
func GetDB() *DB {
	if instance == nil {
		log.Fatal("Database not initialized. Call InitDB first.")
	}
	return instance
}

// Close stänger anslutningen
func (db *DB) Close() {
	db.Pool.Close()
}

// Generisk Query-funktion
func (db *DB) Query(sql string, args ...interface{}) ([]map[string]interface{}, error) {
	rows, err := db.Pool.Query(context.Background(), sql, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	results := []map[string]interface{}{}
	for rows.Next() {
		values, err := rows.Values()
		if err != nil {
			return nil, err
		}

		rowMap := make(map[string]interface{})
		fieldDescriptions := rows.FieldDescriptions()
		for i, fd := range fieldDescriptions {
			rowMap[string(fd.Name)] = values[i]
		}

		results = append(results, rowMap)
	}

	return results, nil
}
