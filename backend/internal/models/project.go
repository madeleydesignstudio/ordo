package models

import (
	"errors"
	"strings"
	"time"
)

type Project struct {
	ID         int          `json:"id"`
	Title      string       `json:"title"`
	StartDate  NullableDate `json:"start_date"`
	FinishDate NullableDate `json:"finish_date"`
	CreatedAt  time.Time    `json:"created_at"`
	UpdatedAt  time.Time    `json:"updated_at"`
}

func (p *Project) Validate() error {
	if strings.TrimSpace(p.Title) == "" {
		return errors.New("title is required")
	}

	if len(p.Title) > 255 {
		return errors.New("title must not exceed 255 characters")
	}

	// Validate date logic
	if p.StartDate.Valid && p.FinishDate.Valid {
		if p.FinishDate.Time.Before(p.StartDate.Time) {
			return errors.New("finish date cannot be before start date")
		}
	}

	return nil
}
