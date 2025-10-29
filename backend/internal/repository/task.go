package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/danielcmadeley/ordo-backend/internal/database"
	"github.com/danielcmadeley/ordo-backend/internal/models"
)

type TaskRepository struct {
	db *database.DB
}

func NewTaskRepository(db *database.DB) *TaskRepository {
	return &TaskRepository{db: db}
}

func (r *TaskRepository) Create(task models.Task) (*models.Task, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var newTask models.Task
	err := r.db.Pool.QueryRow(ctx,
		`INSERT INTO tasks (project_id, title, description, start_date, finish_date, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
		 RETURNING id, project_id, title, description, start_date, finish_date, created_at, updated_at`,
		task.ProjectID, task.Title, task.Description, task.StartDate, task.FinishDate).Scan(
		&newTask.ID, &newTask.ProjectID, &newTask.Title, &newTask.Description,
		&newTask.StartDate, &newTask.FinishDate, &newTask.CreatedAt, &newTask.UpdatedAt)

	if err != nil {
		return nil, fmt.Errorf("failed to create task: %w", err)
	}

	return &newTask, nil
}

func (r *TaskRepository) GetAll() ([]models.Task, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	rows, err := r.db.Pool.Query(ctx,
		`SELECT id, project_id, title, description, start_date, finish_date, created_at, updated_at
		 FROM tasks ORDER BY created_at DESC`)
	if err != nil {
		return nil, fmt.Errorf("failed to query tasks: %w", err)
	}
	defer rows.Close()

	var tasks []models.Task
	for rows.Next() {
		var task models.Task
		if err := rows.Scan(&task.ID, &task.ProjectID, &task.Title, &task.Description,
			&task.StartDate, &task.FinishDate, &task.CreatedAt, &task.UpdatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan task: %w", err)
		}
		tasks = append(tasks, task)
	}

	return tasks, nil
}

func (r *TaskRepository) GetByID(id int) (*models.Task, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var task models.Task
	err := r.db.Pool.QueryRow(ctx,
		`SELECT id, project_id, title, description, start_date, finish_date, created_at, updated_at
		 FROM tasks WHERE id = $1`,
		id).Scan(&task.ID, &task.ProjectID, &task.Title, &task.Description,
		&task.StartDate, &task.FinishDate, &task.CreatedAt, &task.UpdatedAt)

	if err != nil {
		return nil, fmt.Errorf("failed to get task: %w", err)
	}

	return &task, nil
}

func (r *TaskRepository) GetByProjectID(projectID int) ([]models.Task, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	rows, err := r.db.Pool.Query(ctx,
		`SELECT id, project_id, title, description, start_date, finish_date, created_at, updated_at
		 FROM tasks WHERE project_id = $1 ORDER BY start_date ASC, created_at ASC`,
		projectID)
	if err != nil {
		return nil, fmt.Errorf("failed to query tasks for project: %w", err)
	}
	defer rows.Close()

	var tasks []models.Task
	for rows.Next() {
		var task models.Task
		if err := rows.Scan(&task.ID, &task.ProjectID, &task.Title, &task.Description,
			&task.StartDate, &task.FinishDate, &task.CreatedAt, &task.UpdatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan task: %w", err)
		}
		tasks = append(tasks, task)
	}

	return tasks, nil
}

func (r *TaskRepository) Update(id int, task models.Task) (*models.Task, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var updatedTask models.Task
	err := r.db.Pool.QueryRow(ctx,
		`UPDATE tasks
		 SET project_id = $2, title = $3, description = $4, start_date = $5, finish_date = $6, updated_at = CURRENT_TIMESTAMP
		 WHERE id = $1
		 RETURNING id, project_id, title, description, start_date, finish_date, created_at, updated_at`,
		id, task.ProjectID, task.Title, task.Description, task.StartDate, task.FinishDate).Scan(
		&updatedTask.ID, &updatedTask.ProjectID, &updatedTask.Title, &updatedTask.Description,
		&updatedTask.StartDate, &updatedTask.FinishDate, &updatedTask.CreatedAt, &updatedTask.UpdatedAt)

	if err != nil {
		return nil, fmt.Errorf("failed to update task: %w", err)
	}

	return &updatedTask, nil
}

func (r *TaskRepository) Delete(id int) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := r.db.Pool.Exec(ctx, "DELETE FROM tasks WHERE id = $1", id)
	if err != nil {
		return fmt.Errorf("failed to delete task: %w", err)
	}

	rowsAffected := result.RowsAffected()
	if rowsAffected == 0 {
		return fmt.Errorf("task with id %d not found", id)
	}

	return nil
}

func (r *TaskRepository) DeleteByProjectID(projectID int) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := r.db.Pool.Exec(ctx, "DELETE FROM tasks WHERE project_id = $1", projectID)
	if err != nil {
		return fmt.Errorf("failed to delete tasks for project: %w", err)
	}

	return nil
}

func (r *TaskRepository) CountByProjectID(projectID int) (int, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var count int
	err := r.db.Pool.QueryRow(ctx,
		"SELECT COUNT(*) FROM tasks WHERE project_id = $1",
		projectID).Scan(&count)

	if err != nil {
		return 0, fmt.Errorf("failed to count tasks for project: %w", err)
	}

	return count, nil
}
