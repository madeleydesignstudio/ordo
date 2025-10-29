package handlers

import (
	"log"
	"strconv"

	"github.com/gofiber/fiber/v2"

	"github.com/danielcmadeley/ordo-backend/internal/database"
	"github.com/danielcmadeley/ordo-backend/internal/models"
	"github.com/danielcmadeley/ordo-backend/internal/repository"
)

type ProjectHandler struct {
	repo     *repository.ProjectRepository
	taskRepo *repository.TaskRepository
}

func NewProjectHandler(db *database.DB) *ProjectHandler {
	return &ProjectHandler{
		repo:     repository.NewProjectRepository(db),
		taskRepo: repository.NewTaskRepository(db),
	}
}

func (h *ProjectHandler) Create(c *fiber.Ctx) error {
	var project models.Project
	if err := c.BodyParser(&project); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate project data
	if err := project.Validate(); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Create project
	newProject, err := h.repo.Create(project)
	if err != nil {
		log.Printf("Failed to create project: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create project",
		})
	}

	log.Printf("✅ Created project: %+v", newProject)
	return c.Status(fiber.StatusCreated).JSON(newProject)
}

func (h *ProjectHandler) GetAll(c *fiber.Ctx) error {
	projects, err := h.repo.GetAll()
	if err != nil {
		log.Printf("Failed to get projects: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve projects",
		})
	}

	return c.JSON(projects)
}

func (h *ProjectHandler) GetByID(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid project ID",
		})
	}

	project, err := h.repo.GetByID(id)
	if err != nil {
		log.Printf("Failed to get project: %v", err)
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Project not found",
		})
	}

	return c.JSON(project)
}

func (h *ProjectHandler) GetWithTasks(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid project ID",
		})
	}

	project, tasks, err := h.repo.GetWithTasks(id)
	if err != nil {
		log.Printf("Failed to get project with tasks: %v", err)
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Project not found",
		})
	}

	return c.JSON(fiber.Map{
		"project": project,
		"tasks":   tasks,
	})
}

func (h *ProjectHandler) Update(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid project ID",
		})
	}

	var project models.Project
	if err := c.BodyParser(&project); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate project data
	if err := project.Validate(); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Update project
	updatedProject, err := h.repo.Update(id, project)
	if err != nil {
		log.Printf("Failed to update project: %v", err)
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Project not found",
		})
	}

	log.Printf("✅ Updated project: %+v", updatedProject)
	return c.JSON(updatedProject)
}

func (h *ProjectHandler) Delete(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid project ID",
		})
	}

	// Check if project has tasks
	taskCount, err := h.taskRepo.CountByProjectID(id)
	if err != nil {
		log.Printf("Failed to count tasks for project: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to verify project dependencies",
		})
	}

	// Delete project (tasks will be cascade deleted due to foreign key constraint)
	err = h.repo.Delete(id)
	if err != nil {
		log.Printf("Failed to delete project: %v", err)
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Project not found",
		})
	}

	log.Printf("✅ Deleted project with ID: %d (and %d associated tasks)", id, taskCount)
	return c.JSON(fiber.Map{
		"message":       "Project deleted successfully",
		"id":            id,
		"tasks_deleted": taskCount,
	})
}
