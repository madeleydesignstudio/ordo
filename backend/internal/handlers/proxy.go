package handlers

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"time"

	"github.com/gofiber/fiber/v2"

	"github.com/danielcmadeley/ordo-backend/internal/config"
)

const electricAPIBaseURL = "https://api.electric-sql.cloud/v1/shape"

var httpClient = &http.Client{
	Timeout: 30 * time.Second,
}

type ProxyHandler struct {
	config *config.Config
}

func NewProxyHandler(cfg *config.Config) *ProxyHandler {
	return &ProxyHandler{
		config: cfg,
	}
}

func (h *ProxyHandler) Shape(c *fiber.Ctx) error {
	// Build the target URL
	targetURL, err := h.buildTargetURL(c)
	if err != nil {
		log.Printf("Failed to build target URL: %v", err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request parameters",
		})
	}

	// Make the proxied request
	resp, err := h.makeProxyRequest(targetURL)
	if err != nil {
		log.Printf("Proxy request failed: %v", err)
		return c.Status(fiber.StatusBadGateway).JSON(fiber.Map{
			"error": "Failed to fetch data from Electric SQL",
		})
	}
	defer resp.Body.Close()

	// Copy response to client
	return h.copyResponse(c, resp)
}

func (h *ProxyHandler) buildTargetURL(c *fiber.Ctx) (string, error) {
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
	query.Set("source_id", h.config.SourceID)
	query.Set("secret", h.config.SourceSecret)

	originURL.RawQuery = query.Encode()
	return originURL.String(), nil
}

func (h *ProxyHandler) makeProxyRequest(targetURL string) (*http.Response, error) {
	log.Printf("Proxying request to: %s", targetURL)
	return httpClient.Get(targetURL)
}

func (h *ProxyHandler) copyResponse(c *fiber.Ctx, resp *http.Response) error {
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
