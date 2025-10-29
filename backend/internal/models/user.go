package models

import (
	"errors"
	"strings"
)

type User struct {
	ID    int    `json:"id"`
	Email string `json:"email"`
	Name  string `json:"name"`
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
