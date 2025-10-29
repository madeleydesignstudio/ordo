-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    finish_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Create an index on project_id for faster project-based queries
CREATE INDEX idx_tasks_project_id ON tasks(project_id);

-- Create an index on title for faster searches
CREATE INDEX idx_tasks_title ON tasks(title);

-- Create an index on dates for filtering
CREATE INDEX idx_tasks_dates ON tasks(start_date, finish_date);

-- Create a compound index for project tasks ordered by dates
CREATE INDEX idx_tasks_project_dates ON tasks(project_id, start_date, finish_date);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX IF EXISTS idx_tasks_project_dates;
DROP INDEX IF EXISTS idx_tasks_dates;
DROP INDEX IF EXISTS idx_tasks_title;
DROP INDEX IF EXISTS idx_tasks_project_id;
DROP TABLE IF EXISTS tasks;
-- +goose StatementEnd
