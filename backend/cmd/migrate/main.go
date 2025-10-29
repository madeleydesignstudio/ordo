package main

import (
	"database/sql"
	"flag"
	"fmt"
	"log"
	"os"

	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/joho/godotenv"
	"github.com/pressly/goose/v3"
)

var (
	flags = flag.NewFlagSet("migrate", flag.ExitOnError)
	dir   = flags.String("dir", "migrations", "directory with migration files")
)

func main() {
	flags.Usage = usage
	flags.Parse(os.Args[1:])

	args := flags.Args()
	if len(args) < 1 {
		flags.Usage()
		return
	}

	command := args[0]

	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL environment variable is required")
	}

	// Open database connection
	db, err := sql.Open("pgx", dbURL)
	if err != nil {
		log.Fatalf("Failed to open database: %v", err)
	}
	defer db.Close()

	// Test database connection
	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}

	// Run goose command
	switch command {
	case "up":
		if err := goose.Up(db, *dir); err != nil {
			log.Fatalf("Failed to run migrations up: %v", err)
		}
		fmt.Println("✅ Migrations completed successfully")

	case "down":
		if err := goose.Down(db, *dir); err != nil {
			log.Fatalf("Failed to run migration down: %v", err)
		}
		fmt.Println("✅ Migration rolled back successfully")

	case "status":
		if err := goose.Status(db, *dir); err != nil {
			log.Fatalf("Failed to get migration status: %v", err)
		}

	case "create":
		if len(args) < 2 {
			log.Fatal("Usage: migrate create <name>")
		}
		name := args[1]
		if err := goose.Create(db, *dir, name, "sql"); err != nil {
			log.Fatalf("Failed to create migration: %v", err)
		}
		fmt.Printf("✅ Created new migration: %s\n", name)

	case "reset":
		if err := goose.Reset(db, *dir); err != nil {
			log.Fatalf("Failed to reset database: %v", err)
		}
		fmt.Println("✅ Database reset successfully")

	case "version":
		version, err := goose.GetDBVersion(db)
		if err != nil {
			log.Fatalf("Failed to get database version: %v", err)
		}
		fmt.Printf("Current database version: %d\n", version)

	case "redo":
		if err := goose.Redo(db, *dir); err != nil {
			log.Fatalf("Failed to redo migration: %v", err)
		}
		fmt.Println("✅ Migration redone successfully")

	default:
		log.Printf("Unknown command: %s", command)
		flags.Usage()
	}
}

func usage() {
	fmt.Print(`migrate is a database migration tool using goose

Usage:
    migrate [options] <command> [command-options]

Commands:
    up          Apply all available migrations
    down        Roll back the most recent migration
    status      Show migration status
    create      Create a new migration file
    reset       Roll back all migrations
    version     Show current database version
    redo        Re-run the most recent migration

Options:
    -dir string
            directory with migration files (default "migrations")

Examples:
    migrate up
    migrate down
    migrate status
    migrate create add_users_table
    migrate reset
    migrate version
    migrate redo

Environment Variables:
    DATABASE_URL    PostgreSQL connection string (required)
`)
}
