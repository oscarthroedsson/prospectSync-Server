package config

type AppConfig struct {
	Postgres *PostgresConfig
}

func LoadConfig() *AppConfig {
	return &AppConfig{
		Postgres: LoadPostgresConfig(),
	}
}
