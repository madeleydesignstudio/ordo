-- +goose Up
-- +goose StatementBegin
INSERT INTO projects (title, start_date, finish_date) VALUES
('Website Redesign', '2024-01-15', '2024-03-30'),
('Mobile App Development', '2024-02-01', '2024-06-15'),
('Database Migration', '2024-01-01', '2024-02-28'),
('API Documentation', '2024-03-01', '2024-03-31');

INSERT INTO tasks (project_id, title, description, start_date, finish_date) VALUES
-- Website Redesign tasks
(1, 'Design Mockups', 'Create wireframes and visual designs for the new website layout', '2024-01-15', '2024-02-01'),
(1, 'Frontend Development', 'Implement the new design using React and TailwindCSS', '2024-02-02', '2024-03-15'),
(1, 'Backend Integration', 'Connect frontend to existing API endpoints', '2024-03-01', '2024-03-25'),
(1, 'Testing and Deployment', 'QA testing and production deployment', '2024-03-26', '2024-03-30'),

-- Mobile App Development tasks
(2, 'Market Research', 'Research target audience and competitor analysis', '2024-02-01', '2024-02-15'),
(2, 'UI/UX Design', 'Design mobile app interface and user experience', '2024-02-16', '2024-03-15'),
(2, 'iOS Development', 'Develop native iOS application', '2024-03-16', '2024-05-15'),
(2, 'Android Development', 'Develop native Android application', '2024-03-16', '2024-05-15'),
(2, 'App Store Submission', 'Submit apps to App Store and Google Play', '2024-05-16', '2024-06-15'),

-- Database Migration tasks
(3, 'Schema Analysis', 'Analyze current database schema and plan migration', '2024-01-01', '2024-01-15'),
(3, 'Migration Scripts', 'Write migration scripts for data transfer', '2024-01-16', '2024-02-01'),
(3, 'Testing Migration', 'Test migration in staging environment', '2024-02-02', '2024-02-15'),
(3, 'Production Migration', 'Execute migration in production', '2024-02-16', '2024-02-28'),

-- API Documentation tasks
(4, 'Endpoint Documentation', 'Document all API endpoints with examples', '2024-03-01', '2024-03-20'),
(4, 'Integration Examples', 'Create code examples for common integrations', '2024-03-21', '2024-03-31');
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DELETE FROM tasks WHERE project_id IN (1, 2, 3, 4);
DELETE FROM projects WHERE id IN (1, 2, 3, 4);
-- +goose StatementEnd
