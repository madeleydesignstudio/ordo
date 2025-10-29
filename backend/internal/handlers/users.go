package handlers

import (
	"log"
	"strconv"

	"github.com/gofiber/fiber/v2"

	"github.com/danielcmadeley/ordo-backend/internal/database"
	"github.com/danielcmadeley/ordo-backend/internal/models"
	"github.com/danielcmadeley/ordo-backend/internal/repository"
)

type UserHandler struct {
	repo *repository.UserRepository
}

func NewUserHandler(db *database.DB) *UserHandler {
	return &UserHandler{
		repo: repository.NewUserRepository(db),
	}
}

func (h *UserHandler) Create(c *fiber.Ctx) error {
	var user models.User
	if err := c.BodyParser(&user); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate user data
	if err := user.Validate(); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Create user
	newUser, err := h.repo.Create(user)
	if err != nil {
		log.Printf("Failed to create user: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create user",
		})
	}

	log.Printf("✅ Created user: %+v", newUser)
	return c.Status(fiber.StatusCreated).JSON(newUser)
}

func (h *UserHandler) GetAll(c *fiber.Ctx) error {
	users, err := h.repo.GetAll()
	if err != nil {
		log.Printf("Failed to get users: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve users",
		})
	}

	return c.JSON(users)
}

func (h *UserHandler) GetByID(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	user, err := h.repo.GetByID(id)
	if err != nil {
		log.Printf("Failed to get user: %v", err)
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	return c.JSON(user)
}

func (h *UserHandler) Delete(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	err = h.repo.Delete(id)
	if err != nil {
		log.Printf("Failed to delete user: %v", err)
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	log.Printf("✅ Deleted user with ID: %d", id)
	return c.JSON(fiber.Map{
		"message": "User deleted successfully",
		"id":      id,
	})
}
