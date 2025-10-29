package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/danielcmadeley/ordo-backend/internal/database"
	"github.com/danielcmadeley/ordo-backend/internal/models"
)

type ProjectRepository struct {
	db *database.DB
}

func NewProjectRepository(db *database.DB) *ProjectRepository {
	return &ProjectRepository{db: db}
}

func (r *ProjectRepository) Create(project models.Project) (*models.Project, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var newProject models.Project
	err := r.db.Pool.QueryRow(ctx,
		`INSERT INTO projects (title, start_date, finish_date, created_at, updated_at)
		 VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
		 RETURNING id, title, start_date, finish_date, created_at, updated_at`,
		project.Title, project.StartDate, project.FinishDate).Scan(
		&newProject.ID, &newProject.Title, &newProject.StartDate, &newProject.FinishDate,
		&newProject.CreatedAt, &newProject.UpdatedAt)

	if err != nil {
		return nil, fmt.Errorf("failed to create project: %w", err)
	}

	return &newProject, nil
}

func (r *ProjectRepository) GetAll() ([]models.Project, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	rows, err := r.db.Pool.Query(ctx,
		`SELECT id, title, start_date, finish_date, created_at, updated_at
		 FROM projects ORDER BY created_at DESC`)
	if err != nil {
		return nil, fmt.Errorf("failed to query projects: %w", err)
	}
	defer rows.Close()

	var projects []models.Project
	for rows.Next() {
		var project models.Project
		if err := rows.Scan(&project.ID, &project.Title, &project.StartDate,
			&project.FinishDate, &project.CreatedAt, &project.UpdatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan project: %w", err)
		}
		projects = append(projects, project)
	}

	return projects, nil
}

func (r *ProjectRepository) GetByID(id int) (*models.Project, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var project models.Project
	err := r.db.Pool.QueryRow(ctx,
		`SELECT id, title, start_date, finish_date, created_at, updated_at
		 FROM projects WHERE id = $1`,
		id).Scan(&project.ID, &project.Title, &project.StartDate,
		&project.FinishDate, &project.CreatedAt, &project.UpdatedAt)

	if err != nil {
		return nil, fmt.Errorf("failed to get project: %w", err)
	}

	return &project, nil
}

func (r *ProjectRepository) Update(id int, project models.Project) (*models.Project, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var updatedProject models.Project
	err := r.db.Pool.QueryRow(ctx,
		`UPDATE projects
		 SET title = $2, start_date = $3, finish_date = $4, updated_at = CURRENT_TIMESTAMP
		 WHERE id = $1
		 RETURNING id, title, start_date, finish_date, created_at, updated_at`,
		id, project.Title, project.StartDate, project.FinishDate).Scan(
		&updatedProject.ID, &updatedProject.Title, &updatedProject.StartDate,
		&updatedProject.FinishDate, &updatedProject.CreatedAt, &updatedProject.UpdatedAt)

	if err != nil {
		return nil, fmt.Errorf("failed to update project: %w", err)
	}

	return &updatedProject, nil
}

func (r *ProjectRepository) Delete(id int) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := r.db.Pool.Exec(ctx, "DELETE FROM projects WHERE id = $1", id)
	if err != nil {
		return fmt.Errorf("failed to delete project: %w", err)
	}

	rowsAffected := result.RowsAffected()
	if rowsAffected == 0 {
		return fmt.Errorf("project with id %d not found", id)
	}

	return nil
}

func (r *ProjectRepository) GetWithTasks(id int) (*models.Project, []models.Task, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	// Get project
	project, err := r.GetByID(id)
	if err != nil {
		return nil, nil, err
	}

	// Get tasks for this project
	rows, err := r.db.Pool.Query(ctx,
		`SELECT id, project_id, title, description, start_date, finish_date, created_at, updated_at
		 FROM tasks WHERE project_id = $1 ORDER BY start_date ASC, created_at ASC`,
		id)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to query tasks: %w", err)
	}
	defer rows.Close()

	var tasks []models.Task
	for rows.Next() {
		var task models.Task
		if err := rows.Scan(&task.ID, &task.ProjectID, &task.Title, &task.Description,
			&task.StartDate, &task.FinishDate, &task.CreatedAt, &task.UpdatedAt); err != nil {
			return nil, nil, fmt.Errorf("failed to scan task: %w", err)
		}
		tasks = append(tasks, task)
	}

	return project, tasks, nil
}
