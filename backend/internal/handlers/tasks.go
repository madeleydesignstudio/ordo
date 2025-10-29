package handlers

import (
	"log"
	"strconv"

	"github.com/gofiber/fiber/v2"

	"github.com/danielcmadeley/ordo-backend/internal/database"
	"github.com/danielcmadeley/ordo-backend/internal/models"
	"github.com/danielcmadeley/ordo-backend/internal/repository"
)

type TaskHandler struct {
	repo        *repository.TaskRepository
	projectRepo *repository.ProjectRepository
}

func NewTaskHandler(db *database.DB) *TaskHandler {
	return &TaskHandler{
		repo:        repository.NewTaskRepository(db),
		projectRepo: repository.NewProjectRepository(db),
	}
}

func (h *TaskHandler) Create(c *fiber.Ctx) error {
	var task models.Task
	if err := c.BodyParser(&task); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate task data
	if err := task.Validate(); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Verify that the project exists
	_, err := h.projectRepo.GetByID(task.ProjectID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Project not found",
		})
	}

	// Create task
	newTask, err := h.repo.Create(task)
	if err != nil {
		log.Printf("Failed to create task: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create task",
		})
	}

	log.Printf("✅ Created task: %+v", newTask)
	return c.Status(fiber.StatusCreated).JSON(newTask)
}

func (h *TaskHandler) GetAll(c *fiber.Ctx) error {
	tasks, err := h.repo.GetAll()
	if err != nil {
		log.Printf("Failed to get tasks: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve tasks",
		})
	}

	return c.JSON(tasks)
}

func (h *TaskHandler) GetByID(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid task ID",
		})
	}

	task, err := h.repo.GetByID(id)
	if err != nil {
		log.Printf("Failed to get task: %v", err)
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Task not found",
		})
	}

	return c.JSON(task)
}

func (h *TaskHandler) GetByProjectID(c *fiber.Ctx) error {
	projectIDStr := c.Params("projectId")
	projectID, err := strconv.Atoi(projectIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid project ID",
		})
	}

	// Verify that the project exists
	_, err = h.projectRepo.GetByID(projectID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Project not found",
		})
	}

	tasks, err := h.repo.GetByProjectID(projectID)
	if err != nil {
		log.Printf("Failed to get tasks for project: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve tasks",
		})
	}

	return c.JSON(tasks)
}

func (h *TaskHandler) Update(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid task ID",
		})
	}

	var task models.Task
	if err := c.BodyParser(&task); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate task data
	if err := task.Validate(); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Verify that the project exists
	_, err = h.projectRepo.GetByID(task.ProjectID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Project not found",
		})
	}

	// Update task
	updatedTask, err := h.repo.Update(id, task)
	if err != nil {
		log.Printf("Failed to update task: %v", err)
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Task not found",
		})
	}

	log.Printf("✅ Updated task: %+v", updatedTask)
	return c.JSON(updatedTask)
}

func (h *TaskHandler) Delete(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid task ID",
		})
	}

	err = h.repo.Delete(id)
	if err != nil {
		log.Printf("Failed to delete task: %v", err)
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Task not found",
		})
	}

	log.Printf("✅ Deleted task with ID: %d", id)
	return c.JSON(fiber.Map{
		"message": "Task deleted successfully",
		"id":      id,
	})
}
