package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/danielcmadeley/ordo-backend/internal/database"
	"github.com/danielcmadeley/ordo-backend/internal/models"
)

type UserRepository struct {
	db *database.DB
}

func NewUserRepository(db *database.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(user models.User) (*models.User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var newUser models.User
	err := r.db.Pool.QueryRow(ctx,
		"INSERT INTO users (email, name, google_id, picture, verified_email, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id, email, name, COALESCE(google_id, ''), COALESCE(picture, ''), COALESCE(verified_email, false), created_at, updated_at",
		user.Email, user.Name, user.GoogleID, user.Picture, user.VerifiedEmail).Scan(&newUser.ID, &newUser.Email, &newUser.Name, &newUser.GoogleID, &newUser.Picture, &newUser.VerifiedEmail, &newUser.CreatedAt, &newUser.UpdatedAt)

	if err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	return &newUser, nil
}

func (r *UserRepository) GetAll() ([]models.User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	rows, err := r.db.Pool.Query(ctx, "SELECT id, email, name, COALESCE(google_id, ''), COALESCE(picture, ''), COALESCE(verified_email, false), created_at, updated_at FROM users ORDER BY id")
	if err != nil {
		return nil, fmt.Errorf("failed to query users: %w", err)
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var user models.User
		if err := rows.Scan(&user.ID, &user.Email, &user.Name, &user.GoogleID, &user.Picture, &user.VerifiedEmail, &user.CreatedAt, &user.UpdatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan user: %w", err)
		}
		users = append(users, user)
	}

	return users, nil
}

func (r *UserRepository) GetByID(id int) (*models.User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var user models.User
	err := r.db.Pool.QueryRow(ctx,
		"SELECT id, email, name, COALESCE(google_id, ''), COALESCE(picture, ''), COALESCE(verified_email, false), created_at, updated_at FROM users WHERE id = $1",
		id).Scan(&user.ID, &user.Email, &user.Name, &user.GoogleID, &user.Picture, &user.VerifiedEmail, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	return &user, nil
}

func (r *UserRepository) Delete(id int) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := r.db.Pool.Exec(ctx, "DELETE FROM users WHERE id = $1", id)
	if err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}

	rowsAffected := result.RowsAffected()
	if rowsAffected == 0 {
		return fmt.Errorf("user with id %d not found", id)
	}

	return nil
}

// CreateOrUpdateOAuthUser creates a new user or updates existing OAuth user using UPSERT
func (r *UserRepository) CreateOrUpdateOAuthUser(googleID, email, name, picture string, verifiedEmail bool) (*models.User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var user models.User

	// Use PostgreSQL UPSERT (ON CONFLICT) to handle create or update
	err := r.db.Pool.QueryRow(ctx, `
		INSERT INTO users (email, name, google_id, picture, verified_email, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
		ON CONFLICT (google_id)
		DO UPDATE SET
			email = EXCLUDED.email,
			name = EXCLUDED.name,
			picture = EXCLUDED.picture,
			verified_email = EXCLUDED.verified_email,
			updated_at = CURRENT_TIMESTAMP
		RETURNING id, email, name, google_id, picture, verified_email, created_at, updated_at`,
		email, name, googleID, picture, verifiedEmail).Scan(
		&user.ID, &user.Email, &user.Name, &user.GoogleID, &user.Picture, &user.VerifiedEmail, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		return nil, fmt.Errorf("failed to create or update OAuth user: %w", err)
	}

	return &user, nil
}

// GetByGoogleID retrieves a user by their Google ID
func (r *UserRepository) GetByGoogleID(googleID string) (*models.User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var user models.User
	err := r.db.Pool.QueryRow(ctx,
		"SELECT id, email, name, google_id, picture, verified_email, created_at, updated_at FROM users WHERE google_id = $1",
		googleID).Scan(&user.ID, &user.Email, &user.Name, &user.GoogleID, &user.Picture, &user.VerifiedEmail, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		return nil, fmt.Errorf("failed to get user by Google ID: %w", err)
	}

	return &user, nil
}
