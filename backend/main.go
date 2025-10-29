package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/joho/godotenv"
)

const (
	electricAPIBaseURL = "https://api.electric-sql.cloud/v1/shape"
	defaultPort        = ":8080"
)

var (
	httpClient = &http.Client{
		Timeout: 30 * time.Second,
	}
)

type User struct {
	ID    int    `json:"id"`
	Email string `json:"email"`
	Name  string `json:"name"`
}

type Config struct {
	SourceID     string
	SourceSecret string
	Port         string
	DB           *DB
}

func loadConfig() (*Config, error) {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	sourceID := os.Getenv("SOURCE_ID")
	sourceSecret := os.Getenv("SOURCE_SECRET")

	if sourceID == "" || sourceSecret == "" {
		return nil, fmt.Errorf("SOURCE_ID and SOURCE_SECRET environment variables are required")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	} else if port[0] != ':' {
		port = ":" + port
	}

	// Initialize database connection
	db, err := NewDB()
	if err != nil {
		return nil, fmt.Errorf("failed to initialize database: %w", err)
	}

	return &Config{
		SourceID:     sourceID,
		SourceSecret: sourceSecret,
		Port:         port,
		DB:           db,
	}, nil
}

func main() {
	config, err := loadConfig()
	if err != nil {
		log.Fatal("Configuration error:", err)
	}

	// Close database connection when main exits
	defer config.DB.Close()

	app := setupFiberApp()
	setupRoutes(app, config)

	log.Printf("🚀 Server starting on %s", config.Port)
	log.Fatal(app.Listen(config.Port))
}

func setupFiberApp() *fiber.App {
	app := fiber.New(fiber.Config{
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			return c.Status(code).JSON(fiber.Map{
				"error": err.Error(),
			})
		},
	})

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

	return app
}

func setupRoutes(app *fiber.App, config *Config) {
	// Health check endpoint
	app.Get("/health", handleHealth)

	// Electric SQL Shape proxy endpoint
	app.Get("/shape", func(c *fiber.Ctx) error {
		return handleShapeProxy(c, config)
	})

	api := app.Group("/api")
	api.Post("/users", func(c *fiber.Ctx) error {
		return handleCreateUser(c, config.DB)
	})
}

func handleCreateUser(c *fiber.Ctx, db *DB) error {
	var user User
	if err := c.BodyParser(&user); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate required fields
	if user.Email == "" || user.Name == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Email and name are required",
		})
	}

	// Create user in database
	newUser, err := db.CreateUser(user)
	if err != nil {
		log.Printf("Failed to create user: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create user",
		})
	}

	log.Printf("✅ Created user: %+v", newUser)
	return c.Status(fiber.StatusCreated).JSON(newUser)
}

func handleHealth(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"status":    "ok",
		"service":   "electric-proxy",
		"timestamp": time.Now().Unix(),
	})
}

func handleShapeProxy(c *fiber.Ctx, config *Config) error {
	// Build the target URL
	targetURL, err := buildTargetURL(c, config)
	if err != nil {
		log.Printf("Failed to build target URL: %v", err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request parameters",
		})
	}

	// Make the proxied request
	resp, err := makeProxyRequest(targetURL)
	if err != nil {
		log.Printf("Proxy request failed: %v", err)
		return c.Status(fiber.StatusBadGateway).JSON(fiber.Map{
			"error": "Failed to fetch data from Electric SQL",
		})
	}
	defer resp.Body.Close()

	// Copy response to client
	return copyResponse(c, resp)
}

func buildTargetURL(c *fiber.Ctx, config *Config) (string, error) {
	originURL, err := url.Parse(electricAPIBaseURL)
	if err != nil {
		return "", err
	}

	// Copy query parameters from request
	query := originURL.Query()
	for key, value := range c.Queries() {
		query.Set(key, value)
	}

	// Add authentication parameters
	query.Set("source_id", config.SourceID)
	query.Set("secret", config.SourceSecret)

	originURL.RawQuery = query.Encode()
	return originURL.String(), nil
}

func makeProxyRequest(targetURL string) (*http.Response, error) {
	log.Printf("Proxying request to: %s", targetURL)
	return httpClient.Get(targetURL)
}

func copyResponse(c *fiber.Ctx, resp *http.Response) error {
	// Copy response headers (excluding problematic ones)
	excludedHeaders := map[string]bool{
		"Content-Encoding":  true,
		"Content-Length":    true,
		"Transfer-Encoding": true,
	}

	for key, values := range resp.Header {
		if !excludedHeaders[key] {
			for _, value := range values {
				c.Set(key, value)
			}
		}
	}

	// Set status code
	c.Status(resp.StatusCode)

	// Stream the response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("failed to read response body: %w", err)
	}

	return c.Send(body)
}
