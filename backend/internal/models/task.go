package models

import (
	"errors"
	"strings"
	"time"
)

type Task struct {
	ID          int          `json:"id"`
	ProjectID   int          `json:"project_id"`
	Title       string       `json:"title"`
	Description string       `json:"description"`
	StartDate   NullableDate `json:"start_date"`
	FinishDate  NullableDate `json:"finish_date"`
	CreatedAt   time.Time    `json:"created_at"`
	UpdatedAt   time.Time    `json:"updated_at"`
}

func (t *Task) Validate() error {
	if strings.TrimSpace(t.Title) == "" {
		return errors.New("title is required")
	}

	if len(t.Title) > 255 {
		return errors.New("title must not exceed 255 characters")
	}

	if t.ProjectID <= 0 {
		return errors.New("valid project_id is required")
	}

	// Validate date logic
	if t.StartDate.Valid && t.FinishDate.Valid {
		if t.FinishDate.Time.Before(t.StartDate.Time) {
			return errors.New("finish date cannot be before start date")
		}
	}

	return nil
}
