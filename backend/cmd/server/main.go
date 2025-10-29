package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"

	"github.com/danielcmadeley/ordo-backend/internal/config"
	"github.com/danielcmadeley/ordo-backend/internal/database"
	"github.com/danielcmadeley/ordo-backend/internal/handlers"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatal("Configuration error:", err)
	}

	// Initialize database
	db, err := database.New(cfg.DatabaseURL)
	if err != nil {
		log.Fatal("Database connection error:", err)
	}
	defer db.Close()

	// Setup Fiber app
	app := setupApp()

	// Setup routes
	setupRoutes(app, cfg, db)

	log.Printf("🚀 Server starting on %s", cfg.Port)
	log.Fatal(app.Listen(cfg.Port))
}

func setupApp() *fiber.App {
	return fiber.New(fiber.Config{
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			return c.Status(code).JSON(fiber.Map{"error": err.Error()})
		},
	})
}

func setupRoutes(app *fiber.App, cfg *config.Config, db *database.DB) {
	// Middleware
	app.Use(recover.New())
	app.Use(logger.New(logger.Config{
		Format: "${time} ${status} - ${method} ${path} - ${latency}\n",
	}))
	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:5173",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, PUT, DELETE, OPTIONS",
	}))

	// Initialize handlers
	healthHandler := handlers.NewHealthHandler()
	userHandler := handlers.NewUserHandler(db)
	projectHandler := handlers.NewProjectHandler(db)
	taskHandler := handlers.NewTaskHandler(db)
	proxyHandler := handlers.NewProxyHandler(cfg)

	// Routes
	app.Get("/health", healthHandler.Health)
	app.Get("/shape", proxyHandler.Shape)

	// API routes
	api := app.Group("/api")

	// User routes
	api.Post("/users", userHandler.Create)
	api.Get("/users", userHandler.GetAll)
	api.Get("/users/:id", userHandler.GetByID)
	api.Delete("/users/:id", userHandler.Delete)

	// Project routes
	api.Post("/projects", projectHandler.Create)
	api.Get("/projects", projectHandler.GetAll)
	api.Get("/projects/:id", projectHandler.GetByID)
	api.Get("/projects/:id/with-tasks", projectHandler.GetWithTasks)
	api.Put("/projects/:id", projectHandler.Update)
	api.Delete("/projects/:id", projectHandler.Delete)

	// Task routes
	api.Post("/tasks", taskHandler.Create)
	api.Get("/tasks", taskHandler.GetAll)
	api.Get("/tasks/:id", taskHandler.GetByID)
	api.Get("/projects/:projectId/tasks", taskHandler.GetByProjectID)
	api.Put("/tasks/:id", taskHandler.Update)
	api.Delete("/tasks/:id", taskHandler.Delete)
}
