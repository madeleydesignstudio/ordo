# @ordo/cloud-db

A TypeScript cloud database package built with Drizzle ORM and Supabase PostgreSQL for scalable task management.

## Overview

This package provides a type-safe cloud database layer using:
- **Drizzle ORM** - Modern TypeScript ORM with excellent type safety
- **Supabase** - Managed PostgreSQL with real-time capabilities
- **PostgreSQL** - Robust, scalable relational database
- **TypeScript** - Full type safety for database operations

## Features

- 🚀 **Cloud-First** - Designed for Supabase PostgreSQL hosting
- 🔒 **Type Safe** - Full TypeScript support with inferred types
- 📝 **Shared Schema** - Identical schema to local-db for consistency
- 🔄 **Real-time** - Supabase real-time subscriptions support
- 🛠️ **Migrations** - Database schema migrations for PostgreSQL
- 📊 **Utilities** - Cloud-specific database operations and helpers
- 🌐 **Scalable** - Built for production workloads
- 🔐 **Secure** - Row Level Security (RLS) ready

## Installation

```bash
bun install @ordo/cloud-db
```

## Environment Setup

Create a `.env` file with your Supabase credentials:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Direct PostgreSQL Connection (alternative)
DATABASE_URL=postgresql://user:password@host:port/database
```

## Quick Start

### 1. Initialize with Supabase

```typescript
import { initializeSupabaseClient, createDatabaseWithSupabase } from '@ordo/cloud-db';

const supabaseClient = initializeSupabaseClient({
  url: process.env.SUPABASE_URL!,
  anonKey: process.env.SUPABASE_ANON_KEY!,
});

const db = createDatabaseWithSupabase(supabaseClient);
```

### 2. Initialize with Direct PostgreSQL Connection

```typescript
import { createDatabaseWithConnectionString } from '@ordo/cloud-db';

const db = createDatabaseWithConnectionString(process.env.DATABASE_URL!);
```

### 3. Basic Usage

```typescript
import { initializeCloudDatabase, tasks } from '@ordo/cloud-db';
import { eq } from 'drizzle-orm';

// Initialize database
const db = initializeCloudDatabase({
  supabase: {
    url: process.env.SUPABASE_URL!,
    anonKey: process.env.SUPABASE_ANON_KEY!,
  }
});

// Create a task
const newTask = await db.insert(tasks).values({
  title: 'Deploy to production',
  description: 'Set up cloud database and deploy app',
}).returning();

// Query tasks
const allTasks = await db.select().from(tasks);
const completedTasks = await db.select().from(tasks).where(eq(tasks.completed, true));
```

### 4. Using Cloud Utilities

```typescript
import { healthCheck, clearDatabase, testConnection, getTableStats } from '@ordo/cloud-db';

// Test database connection
const connectionTest = await testConnection(db);

// Check database health
const health = await healthCheck(db);

// Get table statistics
const stats = await getTableStats(db);

// Clear all tasks (for development)
await clearDatabase(db);
```

## Schema

The database schema is identical to `@ordo/local-db` for seamless synchronization:

### Tasks Table
- `id` - UUID primary key
- `title` - Task title (required)
- `description` - Task description (optional)
- `completed` - Completion status (defaults to false)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp (auto-updated via trigger)
- `due_date` - Optional due date

## Available Scripts

```bash
# Build the package
bun run build

# Watch mode for development
bun run dev

# Generate Drizzle migrations
bun run generate

# Push schema to database
bun run push

# Run migrations
bun run migrate

# Run Drizzle Studio (database GUI)
bun run studio

# Introspect existing database
bun run introspect
```

## API Reference

### Database Initialization

```typescript
import { 
  initializeCloudDatabase,
  initializeSupabaseClient,
  createDatabaseWithSupabase,
  createDatabaseWithConnectionString 
} from '@ordo/cloud-db';

// Method 1: Full configuration
const db = initializeCloudDatabase({
  supabase: {
    url: "https://your-project.supabase.co",
    anonKey: "your-anon-key",
    serviceRoleKey: "your-service-role-key" // optional
  }
});

// Method 2: Direct PostgreSQL
const db = initializeCloudDatabase({
  connectionString: "postgresql://user:pass@host:port/db"
});

// Method 3: Supabase client first
const supabase = initializeSupabaseClient({
  url: "https://your-project.supabase.co",
  anonKey: "your-anon-key"
});
const db = createDatabaseWithSupabase(supabase);
```

### Schema Types

```typescript
import type { Task, NewTask } from '@ordo/cloud-db';

// Inferred types from schema (identical to local-db)
const task: Task = { id: '...', title: '...', completed: false, ... };
const newTask: NewTask = { title: '...', description: '...' };
```

### Migration Functions

```typescript
import { 
  runMigrations, 
  dropTables,
  resetDatabase 
} from '@ordo/cloud-db';
import postgres from 'postgres';

const client = postgres(process.env.DATABASE_URL!);

// Run migrations
await runMigrations(client);

// Reset database (drop and recreate)
await resetDatabase(client);
```

### Utility Functions

```typescript
import { 
  healthCheck,
  clearDatabase,
  testConnection,
  getTableStats
} from '@ordo/cloud-db';

// Test connection
const connectionResult = await testConnection(db);
console.log(connectionResult.connected); // boolean

// Database health
const health = await healthCheck(db);
console.log(health.status); // "healthy" | "unhealthy"

// Table statistics
const stats = await getTableStats(db);
console.log(stats.tasks); // number of tasks
```

## Supabase Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and API keys

### 2. Run Migrations

```bash
# Using Drizzle Kit
bun run push

# Or using SQL directly in Supabase SQL Editor
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  due_date TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
```

### 3. Set up Row Level Security (Optional)

```sql
-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON tasks
  FOR ALL USING (auth.role() = 'authenticated');

-- Or more granular policies
CREATE POLICY "Users can view their own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## Real-time Subscriptions

```typescript
import { initializeSupabaseClient } from '@ordo/cloud-db';

const supabase = initializeSupabaseClient({
  url: process.env.SUPABASE_URL!,
  anonKey: process.env.SUPABASE_ANON_KEY!,
});

// Subscribe to task changes
const subscription = supabase
  .channel('tasks')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'tasks'
  }, (payload) => {
    console.log('Task changed:', payload);
  })
  .subscribe();

// Cleanup
subscription.unsubscribe();
```

## Development

### Adding New Tables

1. Create schema file in `src/schema/`:

```typescript
// src/schema/projects.ts
import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
```

2. Export from `src/schema/index.ts`:

```typescript
export * from './projects.js';
```

3. Update migrations in `src/migrate.ts`:

```typescript
await client`
  CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
  );
`;
```

### Local Development

```bash
# Start local Supabase (requires Docker)
npx supabase start

# Get local connection details
npx supabase status

# Push schema to local instance
bun run push

# View database in Drizzle Studio
bun run studio
```

## Configuration Options

### Supabase Configuration

```typescript
interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string; // For admin operations
}
```

### Database Configuration

```typescript
interface CloudDatabaseConfig {
  supabase?: SupabaseConfig;
  connectionString?: string;
}
```

## Best Practices

1. **Use environment variables** for sensitive configuration
2. **Enable RLS** for multi-tenant applications
3. **Use prepared statements** for repeated queries
4. **Handle connection pooling** for high-traffic applications
5. **Monitor performance** with Supabase dashboard
6. **Use transactions** for multi-table operations
7. **Validate input data** before database operations

## Troubleshooting

### Common Issues

**Connection failed:**
```typescript
// Check your environment variables
console.log('Database URL:', process.env.SUPABASE_URL);
console.log('Anon Key:', process.env.SUPABASE_ANON_KEY);

// Test connection
const test = await testConnection(db);
console.log(test);
```

**Migration errors:**
```bash
# Check your database permissions
# Ensure service role key is used for migrations
bun run push
```

**Type errors:**
```typescript
// Ensure you're importing the correct types
import type { Task, NewTask } from '@ordo/cloud-db';
```

**RLS blocking queries:**
```sql
-- Temporarily disable RLS for debugging
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
```

## Sync with Local Database

This package maintains schema compatibility with `@ordo/local-db`:

```typescript
// Same schema, different implementations
import { Task as LocalTask } from '@ordo/local-db';
import { Task as CloudTask } from '@ordo/cloud-db';

// Types are identical
const task: LocalTask = { ... };
const cloudTask: CloudTask = task; // No type errors
```

## Production Deployment

1. **Set environment variables** in your hosting platform
2. **Run migrations** during deployment
3. **Monitor connections** and performance
4. **Set up backups** through Supabase dashboard
5. **Configure alerts** for database health

## Contributing

1. Add new features to the appropriate files
2. Update this README with new functionality
3. Ensure schema compatibility with local-db
4. Add tests for new database operations
5. Follow the existing code style and patterns

## License

Private package for the Ordo project.