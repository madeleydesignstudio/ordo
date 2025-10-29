# Ordo Backend

A Go-based backend service for project and task management with real-time sync using Electric SQL.

## Project Structure

```
backend/
├── cmd/
│   ├── server/           # Main application entry point
│   └── migrate/          # Database migration utility
├── internal/
│   ├── config/           # Configuration management
│   ├── database/         # Database connection
│   ├── handlers/         # HTTP request handlers
│   ├── models/           # Data models and validation
│   └── repository/       # Database operations
├── migrations/           # Database schema migrations
├── go.mod               # Go module dependencies
└── go.sum               # Dependency lock file
```

## Database Schema

The application uses PostgreSQL with the following main entities:

### Projects
- `id` (Primary Key)
- `title` (Required, max 255 chars)
- `start_date` (Optional)
- `finish_date` (Optional)
- `created_at`, `updated_at` (Auto-managed timestamps)

### Tasks
- `id` (Primary Key)
- `project_id` (Foreign Key to Projects)
- `title` (Required, max 255 chars)
- `description` (Optional text)
- `start_date` (Optional)
- `finish_date` (Optional)
- `created_at`, `updated_at` (Auto-managed timestamps)

### Users (Existing)
- `id` (Primary Key)
- `email` (Required)
- `name` (Required)

## Setup

### Prerequisites
- Go 1.25+
- PostgreSQL database
- Environment variables configured

### Environment Variables
Create a `.env` file in the backend directory:

```env
DATABASE_URL=postgres://username:password@localhost:5432/ordo_db?sslmode=disable
SOURCE_ID=your_electric_sql_source_id
SOURCE_SECRET=your_electric_sql_secret
PORT=8080
```

### Database Migrations

We use [Goose](https://github.com/pressly/goose) for database migrations.

#### Run Migrations
```bash
# Apply all pending migrations
go run ./cmd/migrate up

# Check migration status
go run ./cmd/migrate status

# Rollback last migration
go run ./cmd/migrate down

# Reset database (rollback all migrations)
go run ./cmd/migrate reset

# Create a new migration
go run ./cmd/migrate create migration_name
```

#### Available Migrations
1. `001_create_projects_table.sql` - Creates projects table with indexes
2. `002_create_tasks_table.sql` - Creates tasks table with foreign key to projects
3. `20251029142813_add_sample_data.sql` - Populates database with sample data

### Running the Application

```bash
# Run the server
go run ./cmd/server

# Or build and run
go build ./cmd/server
./server
```

The server will start on port 8080 (or the port specified in your `.env` file).

## API Endpoints

### Health Check
- `GET /health` - Application health status

### Electric SQL Proxy
- `GET /shape` - Proxy requests to Electric SQL API

### Users
- `POST /api/users` - Create user
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `DELETE /api/users/:id` - Delete user

### Projects
- `POST /api/projects` - Create project
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `GET /api/projects/:id/with-tasks` - Get project with all its tasks
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project (cascade deletes tasks)

### Tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get task by ID
- `GET /api/projects/:projectId/tasks` - Get all tasks for a project
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## API Examples

### Create Project
```bash
curl -X POST http://localhost:8080/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Project",
    "start_date": "2024-01-01",
    "finish_date": "2024-06-30"
  }'
```

### Create Task
```bash
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": 1,
    "title": "New Task",
    "description": "Task description",
    "start_date": "2024-01-15",
    "finish_date": "2024-02-15"
  }'
```

### Get Project with Tasks
```bash
curl http://localhost:8080/api/projects/1/with-tasks
```

## Data Validation

### Projects
- Title is required and must not exceed 255 characters
- Finish date cannot be before start date
- Timestamps are automatically managed

### Tasks
- Title is required and must not exceed 255 characters
- Project ID must reference an existing project
- Finish date cannot be before start date
- Tasks are automatically deleted when parent project is deleted

## Database Features

### Indexes
- Projects: Indexed on title and date ranges for fast searching
- Tasks: Indexed on project_id, title, and date ranges
- Compound index on project_id + dates for efficient project task queries

### Foreign Key Constraints
- Tasks have a foreign key to projects with CASCADE delete
- Deleting a project automatically removes all associated tasks

### Timestamps
- All entities have `created_at` and `updated_at` timestamps
- Automatically managed by the database

## Development

### Adding New Migrations
1. Create migration: `go run ./cmd/migrate create migration_name`
2. Edit the generated SQL file in the `migrations/` directory
3. Run migration: `go run ./cmd/migrate up`

### Migration Best Practices
- Always include both `-- +goose Up` and `-- +goose Down` sections
- Test migrations on development data before production
- Keep migrations small and focused
- Include appropriate indexes for performance

### Testing Migration Rollbacks
```bash
# Apply migration
go run ./cmd/migrate up

# Test rollback
go run ./cmd/migrate down

# Reapply
go run ./cmd/migrate up
```

## Architecture Benefits

- **Clean Architecture**: Separation of concerns with handlers, repositories, and models
- **Type Safety**: Strong typing with Go structs and validation
- **Database Migrations**: Version-controlled schema changes with Goose
- **Real-time Sync**: Integration with Electric SQL for live updates
- **RESTful API**: Standard REST endpoints for all operations
- **Error Handling**: Comprehensive error handling and logging
- **Validation**: Input validation at model and handler levels

## Electric SQL Integration

The application integrates with Electric SQL for real-time data synchronization:
- `/shape` endpoint proxies requests to Electric SQL API
- Supports real-time updates for frontend applications
- Maintains authentication and security through proxy pattern