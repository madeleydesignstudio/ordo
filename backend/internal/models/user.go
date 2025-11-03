package models

import (
	"errors"
	"strings"
	"time"
)

type User struct {
	ID            int       `json:"id"`
	Email         string    `json:"email"`
	Name          string    `json:"name"`
	GoogleID      string    `json:"google_id,omitempty"`
	Picture       string    `json:"picture,omitempty"`
	VerifiedEmail bool      `json:"verified_email"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func (u *User) Validate() error {
	if strings.TrimSpace(u.Email) == "" {
		return errors.New("email is required")
	}

	if strings.TrimSpace(u.Name) == "" {
		return errors.New("name is required")
	}

	// Basic email validation
	if !strings.Contains(u.Email, "@") {
		return errors.New("invalid email format")
	}

	return nil
}
