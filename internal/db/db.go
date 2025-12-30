package db

import (
	"context"
	"log"
	"sync"

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
		pool, err := pgxpool.New(context.Background(), cfg.URL)
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
