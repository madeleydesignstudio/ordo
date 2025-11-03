-- +goose Up
-- +goose StatementBegin
-- Add OAuth2 fields to existing users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS picture TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_email BOOLEAN DEFAULT FALSE;

-- Update existing created_at and updated_at if they don't have timezone info
ALTER TABLE users ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ALTER COLUMN updated_at TYPE TIMESTAMP WITH TIME ZONE;

-- Create unique index on google_id for faster OAuth lookups (only for non-null values)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX IF EXISTS idx_users_google_id;
ALTER TABLE users DROP COLUMN IF EXISTS verified_email;
ALTER TABLE users DROP COLUMN IF EXISTS picture;
ALTER TABLE users DROP COLUMN IF EXISTS google_id;

-- Revert timestamp columns back to without timezone
ALTER TABLE users ALTER COLUMN created_at TYPE TIMESTAMP;
ALTER TABLE users ALTER COLUMN updated_at TYPE TIMESTAMP;
-- +goose StatementEnd
