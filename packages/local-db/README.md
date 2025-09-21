# @ordo/local-db

A simplified TypeScript local database package built with Drizzle ORM and PGlite for offline-first task management.

## Overview

This package provides a type-safe database layer using:
- **Drizzle ORM** - Modern TypeScript ORM with excellent type safety
- **PGlite** - Lightweight WASM PostgreSQL with IndexedDB persistence
- **TypeScript** - Full type safety for database operations

## Features

- 🚀 **Fast Setup** - Persistent PostgreSQL database with IndexedDB storage
- 🔒 **Type Safe** - Full TypeScript support with inferred types
- 📝 **Simple Schema** - Single tasks table with clean structure
- 🔄 **Migrations** - Database schema migrations
- 🛠️ **Utilities** - Common database operations and helpers
- 📊 **Health Checks** - Database connection monitoring
- 💾 **Persistence** - Data survives browser refresh and restart
- 🧹 **No Seeding** - Start with an empty database

## Installation

```bash
bun install @ordo/local-db
```

## Quick Start

### 1. Initialize the Database

```typescript
import { runMigrations, createDatabaseWithClient } from '@ordo/local-db';
import { usePGlite } from '@electric-sql/pglite-react';

// In a React component with PGlite context
const pgliteClient = usePGlite();
const db = createDatabaseWithClient(pgliteClient);

// Run migrations to create tables
await runMigrations(pgliteClient);
```

### 2. Basic Usage

```typescript
import { createDatabaseWithClient, tasks } from '@ordo/local-db';
import { usePGlite } from '@electric-sql/pglite-react';
import { eq } from 'drizzle-orm';

// In a React component
const pgliteClient = usePGlite();
const db = createDatabaseWithClient(pgliteClient);

// Create a task
const newTask = await db.insert(tasks).values({
  title: 'Complete project setup',
  description: 'Set up the database and initial schema',
}).returning();

// Query tasks
const allTasks = await db.select().from(tasks);
const completedTasks = await db.select().from(tasks).where(eq(tasks.completed, true));
```

### 3. Using Utilities

```typescript
import { healthCheck, clearDatabase, createDatabaseWithClient } from '@ordo/local-db';
import { usePGlite } from '@electric-sql/pglite-react';

// In a React component
const pgliteClient = usePGlite();
const db = createDatabaseWithClient(pgliteClient);

// Check database health
const health = await healthCheck(db);

// Clear all tasks (for development)
await clearDatabase(db);
```

## Schema

The database includes a single table:

### Tasks Table
- `id` - UUID primary key
- `title` - Task title (required)
- `description` - Task description (optional)
- `completed` - Completion status (defaults to false)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp
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

# Run Drizzle Studio
bun run studio
```

## API Reference

### Database Connection

```typescript
import { createDatabaseWithClient, initializeClient } from '@ordo/local-db';
import { usePGlite } from '@electric-sql/pglite-react';

// In React components - use PGlite from context
const pgliteClient = usePGlite();
const db = createDatabaseWithClient(pgliteClient);

// Standalone usage (creates persistent IndexedDB storage)
const client = initializeClient({ dataDir: 'idb://my-app-db' });
const db = createDatabaseWithClient(client);

// Direct PGlite client access
await pgliteClient.exec('CREATE INDEX ...');
```

### Schema Types

```typescript
import type { Task, NewTask } from '@ordo/local-db';

// Inferred types from schema
const task: Task = { id: '...', title: '...', completed: false, ... };
const newTask: NewTask = { title: '...', description: '...' };
```

### Utility Functions

```typescript
import { 
  runMigrations, 
  clearDatabase,
  resetDatabase,
  healthCheck 
} from '@ordo/local-db';
```

## Development

### Adding New Tables

1. Create a new schema file in `src/schema/`:

```typescript
// src/schema/categories.ts
import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
```

2. Export from `src/schema/index.ts`:

```typescript
export * from './categories.js';
```

3. Update migrations in `src/migrate.ts`:

```typescript
await client.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
  );
`);
```

### Testing the Database

The database starts empty by design. You can test it by:
1. Adding tasks through the web interface
2. Refreshing the page to confirm persistence
3. Using the developer tools to reset or clear data

## Configuration

The database can be configured for different environments:

```typescript
import { initializeClient, createDatabaseWithClient } from '@ordo/local-db';

// Default persistent storage (IndexedDB in browser)
const client = initializeClient();

// Custom storage location
const client = initializeClient({ dataDir: 'idb://my-custom-db' });

// File system storage (Node.js environments)
const client = initializeClient({ dataDir: './data/database' });

// Create database instance
const db = createDatabaseWithClient(client);
```

### Storage Options

- **Browser**: `idb://database-name` - Uses IndexedDB for persistence
- **Node.js**: `./path/to/directory` - Uses file system storage  
- **Memory**: `:memory:` - In-memory database (not persistent)

### Integration with React

```typescript
// In your main.tsx
import { PGlite } from "@electric-sql/pglite";
import { live } from "@electric-sql/pglite/live";
import { PGliteProvider } from "@electric-sql/pglite-react";

const db = await PGlite.create("idb://ordo-db", {
  extensions: { live },
});

<PGliteProvider db={db}>
  <App />
</PGliteProvider>
```

## Best Practices

1. **Always use transactions** for multi-table operations
2. **Use prepared statements** for repeated queries
3. **Validate input data** before database operations
4. **Handle errors gracefully** with try-catch blocks
5. **Use TypeScript types** for compile-time safety

## Troubleshooting

### Common Issues

**Database not initializing:**
```typescript
// Make sure to run migrations first
await runMigrations();
```

**Type errors:**
```typescript
// Ensure you're importing the correct types
import type { Task } from '@ordo/local-db';
```

**Connection issues:**
```typescript
// Check database health
const health = await healthCheck();
console.log(health.status);
```

## Contributing

1. Add new features to the appropriate files
2. Update this README with new functionality
3. Add tests for new database operations
4. Follow the existing code style and patterns

## License

Private package for the Ordo project.