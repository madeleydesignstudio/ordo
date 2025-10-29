package handlers

import (
	"time"

	"github.com/gofiber/fiber/v2"
)

type HealthHandler struct{}

func NewHealthHandler() *HealthHandler {
	return &HealthHandler{}
}

func (h *HealthHandler) Health(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"status":    "ok",
		"service":   "electric-proxy",
		"timestamp": time.Now().Unix(),
	})
}
