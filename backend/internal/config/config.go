package config

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	SourceID     string
	SourceSecret string
	DatabaseURL  string
	Port         string
}

func Load() (*Config, error) {
	// Load .env file if it exists
	if err := godotenv.Load(); err != nil {
		// It's okay if .env doesn't exist
	}

	cfg := &Config{
		SourceID:     os.Getenv("SOURCE_ID"),
		SourceSecret: os.Getenv("SOURCE_SECRET"),
		DatabaseURL:  os.Getenv("DATABASE_URL"),
		Port:         os.Getenv("PORT"),
	}

	// Validate required fields
	if cfg.SourceID == "" || cfg.SourceSecret == "" {
		return nil, fmt.Errorf("SOURCE_ID and SOURCE_SECRET environment variables are required")
	}

	if cfg.DatabaseURL == "" {
		return nil, fmt.Errorf("DATABASE_URL environment variable is required")
	}

	// Set default port
	if cfg.Port == "" {
		cfg.Port = ":8080"
	} else if cfg.Port[0] != ':' {
		cfg.Port = ":" + cfg.Port
	}

	return cfg, nil
}
