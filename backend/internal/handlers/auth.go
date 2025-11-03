package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/danielcmadeley/ordo-backend/internal/auth"
	"github.com/danielcmadeley/ordo-backend/internal/config"
	"github.com/danielcmadeley/ordo-backend/internal/database"
	"github.com/danielcmadeley/ordo-backend/internal/repository"
	"github.com/gofiber/fiber/v2"
)

// AuthToken represents a simple auth token with user info
type AuthToken struct {
	Token     string    `json:"token"`
	UserID    string    `json:"user_id"`
	Email     string    `json:"email"`
	Name      string    `json:"name"`
	Picture   string    `json:"picture"`
	CreatedAt time.Time `json:"created_at"`
	ExpiresAt time.Time `json:"expires_at"`
}

// Simple in-memory token store (use Redis/database in production)
var tokenStore = make(map[string]*AuthToken)

// AuthHandler handles OAuth2 authentication
type AuthHandler struct {
	googleAuth *auth.GoogleAuth
	db         *database.DB
	userRepo   *repository.UserRepository
}

// NewAuthHandler creates a new AuthHandler
func NewAuthHandler(cfg *config.Config, db *database.DB) *AuthHandler {
	return &AuthHandler{
		googleAuth: auth.NewGoogleAuth(cfg),
		db:         db,
		userRepo:   repository.NewUserRepository(db),
	}
}

// GoogleLogin initiates the Google OAuth2 flow
func (h *AuthHandler) GoogleLogin(c *fiber.Ctx) error {

	// Generate a random state parameter for security
	state, err := generateRandomState()
	if err != nil {

		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate state parameter",
		})
	}

	// Store state in session or cache (simplified here)
	// In production, you should store this securely
	authURL := h.googleAuth.GetAuthURL(state)
	return c.Redirect(authURL)
}

// GoogleCallback handles the OAuth2 callback from Google
func (h *AuthHandler) GoogleCallback(c *fiber.Ctx) error {

	code := c.Query("code")
	errorParam := c.Query("error")

	if errorParam != "" {
		return c.Redirect("http://localhost:5173/?error=" + errorParam)
	}

	if code == "" {
		return c.Redirect("http://localhost:5173/?error=authorization_code_not_provided")
	}

	// Exchange code for token
	token, err := h.googleAuth.ExchangeCode(c.Context(), code)
	if err != nil {
		return c.Redirect("http://localhost:5173/?error=token_exchange_failed")
	}

	// Get user information
	userInfo, err := h.googleAuth.GetUserInfo(token.AccessToken)
	if err != nil {
		return c.Redirect("http://localhost:5173/?error=user_info_failed")
	}

	// Create or update user in database
	dbUser, err := h.userRepo.CreateOrUpdateOAuthUser(
		userInfo.ID,
		userInfo.Email,
		userInfo.Name,
		userInfo.Picture,
		userInfo.Verified,
	)
	if err != nil {
		return c.Redirect("http://localhost:5173/?error=database_error")
	}

	// Generate a simple auth token
	authToken, err := generateAuthToken()
	if err != nil {
		return c.Redirect("http://localhost:5173/?error=token_generation_failed")
	}

	// Store token with user info (in production, use secure storage)
	tokenData := &AuthToken{
		Token:     authToken,
		UserID:    fmt.Sprintf("%d", dbUser.ID),
		Email:     dbUser.Email,
		Name:      dbUser.Name,
		Picture:   dbUser.Picture,
		CreatedAt: time.Now(),
		ExpiresAt: time.Now().Add(24 * time.Hour),
	}
	tokenStore[authToken] = tokenData

	// Redirect to frontend with token
	redirectURL := fmt.Sprintf("http://localhost:5173/?token=%s", authToken)
	return c.Redirect(redirectURL)
}

// VerifyToken verifies an auth token and returns user info
func (h *AuthHandler) VerifyToken(c *fiber.Ctx) error {
	authHeader := c.Get("Authorization")
	if authHeader == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Authorization header missing",
		})
	}

	// Extract token from "Bearer <token>"
	token := ""
	if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
		token = authHeader[7:]
	} else {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid authorization header format",
		})
	}

	// Verify token
	tokenData, exists := tokenStore[token]
	if !exists {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid token",
		})
	}

	// Check if token is expired
	if time.Now().After(tokenData.ExpiresAt) {
		// Clean up expired token
		delete(tokenStore, token)
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Token expired",
		})
	}

	// Return user info with database data
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"user": fiber.Map{
			"id":             tokenData.UserID,
			"email":          tokenData.Email,
			"name":           tokenData.Name,
			"picture":        tokenData.Picture,
			"verified_email": true, // From OAuth
		},
		"token_info": fiber.Map{
			"created_at": tokenData.CreatedAt,
			"expires_at": tokenData.ExpiresAt,
		},
	})
}

// generateAuthToken generates a random auth token
func generateAuthToken() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", fmt.Errorf("failed to generate random bytes: %w", err)
	}
	return hex.EncodeToString(bytes), nil
}

// GetOAuthUsers returns all OAuth users from the database
func (h *AuthHandler) GetOAuthUsers(c *fiber.Ctx) error {
	users, err := h.userRepo.GetAll()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve users",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"users": users,
		"count": len(users),
	})
}

// generateRandomState generates a random state parameter for OAuth2
func generateRandomState() (string, error) {
	bytes := make([]byte, 16)
	if _, err := rand.Read(bytes); err != nil {
		return "", fmt.Errorf("failed to generate random bytes: %w", err)
	}
	return hex.EncodeToString(bytes), nil
}
