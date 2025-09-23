# @ordo/sync-backend

A simple Hono backend service for synchronizing data between PGlite local database and Supabase cloud database.

## Overview

This backend provides REST endpoints to sync tasks from the local PGlite database to the Supabase cloud database when an internet connection is available. It handles:

- **Bidirectional sync** - Push local changes to cloud and pull cloud updates
- **Conflict resolution** - Uses timestamp-based conflict resolution (newest wins)
- **Incremental sync** - Only sync changes since last sync
- **Error handling** - Graceful error handling with detailed responses

## Features

- 🚀 **Fast** - Built with Hono for maximum performance
- 🔄 **Smart Sync** - Only syncs changed data
- 🛡️ **Resilient** - Handles network failures gracefully
- 📊 **Simple** - Minimal API surface for easy integration
- 🔒 **Safe** - Validates data before syncing

## Installation

```bash
cd apps/sync-backend
bun install
```

## Environment Setup

Create a `.env` file:

```bash
# Database connection (same as cloud-db)
DATABASE_URL=postgresql://user:password@host:port/database
# OR
SUPABASE_DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres

# Server configuration
PORT=3001
```

## Development

```bash
# Start development server with hot reload
bun run dev

# Start production server
bun run start

# Build for production
bun run build

# Type check
bun run typecheck
```

## API Endpoints

### Health Check
```
GET /health
```

Returns server status and timestamp.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Sync Local Tasks to Cloud
```
POST /sync/tasks
```

Pushes local tasks to the cloud database. Creates new tasks or updates existing ones if local version is newer.

**Request Body:**
```json
{
  "tasks": [
    {
      "id": "uuid",
      "title": "Task title",
      "description": "Task description",
      "completed": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "dueDate": "2024-01-02T00:00:00.000Z"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "results": {
    "created": 2,
    "updated": 1,
    "errors": []
  },
  "message": "Synced 3 tasks"
}
```

### Get All Cloud Tasks
```
GET /sync/tasks
```

Retrieves all tasks from the cloud database for syncing back to local.

**Response:**
```json
{
  "success": true,
  "tasks": [
    {
      "id": "uuid",
      "title": "Task title",
      "description": "Task description",
      "completed": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "dueDate": "2024-01-02T00:00:00.000Z"
    }
  ]
}
```

### Get Tasks Since Timestamp
```
GET /sync/tasks/since/:timestamp
```

Retrieves tasks modified after the specified timestamp for incremental sync.

**Parameters:**
- `timestamp` - ISO 8601 timestamp (e.g., `2024-01-01T00:00:00.000Z`)

**Response:**
```json
{
  "success": true,
  "tasks": [...],
  "since": "2024-01-01T00:00:00.000Z"
}
```

## Usage Example

### From Frontend Application

```typescript
// Sync local tasks to cloud
async function syncToCloud(localTasks: Task[]) {
  const response = await fetch('http://localhost:3001/sync/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tasks: localTasks }),
  });

  const result = await response.json();
  console.log('Sync result:', result);
  return result;
}

// Get updates from cloud
async function syncFromCloud() {
  const response = await fetch('http://localhost:3001/sync/tasks');
  const result = await response.json();
  
  if (result.success) {
    return result.tasks;
  }
  throw new Error('Failed to fetch from cloud');
}

// Incremental sync since last update
async function incrementalSync(lastSyncTime: string) {
  const response = await fetch(`http://localhost:3001/sync/tasks/since/${lastSyncTime}`);
  const result = await response.json();
  
  if (result.success) {
    return result.tasks;
  }
  throw new Error('Failed to fetch incremental updates');
}
```

### With Network Detection

```typescript
// Check if online before syncing
async function smartSync(localTasks: Task[]) {
  if (!navigator.onLine) {
    console.log('Offline - skipping sync');
    return;
  }

  try {
    await syncToCloud(localTasks);
    console.log('Successfully synced to cloud');
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// Listen for network changes
window.addEventListener('online', () => {
  console.log('Back online - syncing...');
  smartSync(getLocalTasks());
});
```

## Conflict Resolution

The sync backend uses timestamp-based conflict resolution:

1. **Local → Cloud**: Only updates cloud tasks if local `updatedAt` is newer
2. **Cloud → Local**: Frontend should implement similar logic when pulling updates
3. **New Tasks**: Always created regardless of timestamp

## Error Handling

The API returns detailed error information:

```json
{
  "success": false,
  "error": "Failed to sync tasks",
  "details": "Connection timeout",
  "results": {
    "created": 1,
    "updated": 0,
    "errors": [
      {
        "taskId": "uuid",
        "error": "Validation failed: title is required"
      }
    ]
  }
}
```

## Production Deployment

### With Docker

```dockerfile
FROM oven/bun:1 as base
WORKDIR /app

# Install dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copy source
COPY . .

# Build
RUN bun run build

# Expose port
EXPOSE 3001

# Start server
CMD ["bun", "run", "start"]
```

### Environment Variables

Set these in your production environment:

```bash
DATABASE_URL=postgresql://user:password@host:port/database
PORT=3001
NODE_ENV=production
```

## Monitoring

The service logs all sync operations and errors. In production, consider:

- Setting up structured logging
- Adding metrics collection
- Implementing health checks
- Monitoring sync success rates

## Security Considerations

- **Authentication**: Add authentication middleware if needed
- **Rate Limiting**: Consider adding rate limiting for production
- **Input Validation**: Validate all input data
- **CORS**: Configure CORS appropriately for your domain

## Architecture

```
┌─────────────────┐    HTTP/JSON    ┌──────────────────┐
│                 │◄───────────────►│                  │
│  Frontend App   │                 │  Sync Backend    │
│  (PGlite DB)    │                 │  (Hono Server)   │
│                 │                 │                  │
└─────────────────┘                 └──────────────────┘
                                             │
                                             │ SQL
                                             ▼
                                    ┌──────────────────┐
                                    │                  │
                                    │  Supabase Cloud  │
                                    │  (PostgreSQL)    │
                                    │                  │
                                    └──────────────────┘
```

## Contributing

1. Keep the API simple and focused on sync operations
2. Add comprehensive error handling
3. Test with network interruptions
4. Ensure data consistency between local and cloud
5. Follow the existing code style

## License

Private package for the Ordo project.