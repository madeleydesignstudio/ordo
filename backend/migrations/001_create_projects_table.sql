-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    start_date DATE,
    finish_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on title for faster searches
CREATE INDEX idx_projects_title ON projects(title);

-- Create an index on dates for filtering
CREATE INDEX idx_projects_dates ON projects(start_date, finish_date);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX IF EXISTS idx_projects_dates;
DROP INDEX IF EXISTS idx_projects_title;
DROP TABLE IF EXISTS projects;
-- +goose StatementEnd
