# @ordo/database

A TypeScript database package built with Drizzle ORM and PGlite for the Ordo project.

## Overview

This package provides a type-safe database layer using:
- **Drizzle ORM** - Modern TypeScript ORM with excellent type safety
- **PGlite** - Lightweight WASM PostgreSQL that runs in-memory or with persistence
- **TypeScript** - Full type safety for database operations

## Features

- 🚀 **Fast Setup** - Persistent PostgreSQL database with IndexedDB storage
- 🔒 **Type Safe** - Full TypeScript support with inferred types
- 🗃️ **Schema Management** - Declarative schema definition with Drizzle
- 🔄 **Migrations** - Database schema migrations and seeding utilities
- 🛠️ **Utilities** - Common database operations and helpers
- 📊 **Health Checks** - Database connection monitoring
- 💾 **Persistence** - Data survives browser refresh and restart

## Installation

```bash
bun install @ordo/database
```

## Quick Start

### 1. Initialize the Database

```typescript
import { runMigrations, seedDatabase, createDatabaseWithClient } from '@ordo/database';
import { usePGlite } from '@electric-sql/pglite-react';

// In a React component with PGlite context
const pgliteClient = usePGlite();
const db = createDatabaseWithClient(pgliteClient);

// Run migrations to create tables
await runMigrations(pgliteClient);

// Seed with initial data (optional)
await seedDatabase(db);
```

### 2. Basic Usage

```typescript
import { createDatabaseWithClient, users, tasks } from '@ordo/database';
import { usePGlite } from '@electric-sql/pglite-react';
import { eq } from 'drizzle-orm';

// In a React component
const pgliteClient = usePGlite();
const db = createDatabaseWithClient(pgliteClient);

// Create a user
const newUser = await db.insert(users).values({
  email: 'user@ordo.dev',
  name: 'John Doe',
}).returning();

// Create a task
await db.insert(tasks).values({
  title: 'Complete project setup',
  description: 'Set up the database and initial schema',
  userId: newUser[0].id,
});

// Query with relations
const allUsers = await db.select().from(users);
const userTasks = await db.select().from(tasks).where(eq(tasks.userId, newUser[0].id));
```

### 3. Using Utilities

```typescript
import { getUserWithTasks, getUserByEmail, healthCheck, createDatabaseWithClient } from '@ordo/database';
import { usePGlite } from '@electric-sql/pglite-react';

// In a React component
const pgliteClient = usePGlite();
const db = createDatabaseWithClient(pgliteClient);

// Get user with their tasks
const userWithTasks = await getUserWithTasks(userId, db);

// Find user by email
const user = await getUserByEmail('user@ordo.dev', db);

// Check database health
const health = await healthCheck(db);
```

## Schema

The database includes the following tables:

### Users Table
- `id` - UUID primary key
- `email` - Unique email address
- `name` - User's display name
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp
- `is_active` - Account status

### Tasks Table
- `id` - UUID primary key
- `title` - Task title
- `description` - Task description
- `completed` - Completion status
- `user_id` - Foreign key to users table
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
import { createDatabaseWithClient, initializeClient } from '@ordo/database';
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
import type { User, NewUser, Task, NewTask } from '@ordo/database';

// Inferred types from schema
const user: User = { id: '...', email: '...', ... };
const newUser: NewUser = { email: '...', name: '...' };
```

### Utility Functions

```typescript
import { 
  runMigrations, 
  seedDatabase, 
  clearDatabase,
  resetDatabase,
  getUserByEmail,
  getUserWithTasks,
  healthCheck 
} from '@ordo/database';
```

## Development

### Adding New Tables

1. Create a new schema file in `src/schema/`:

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
await client.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
  );
`);
```

### Running Examples

```bash
# Run the example usage
bun run src/example.ts
```

## Configuration

The database can be configured for different environments:

```typescript
import { initializeClient, createDatabaseWithClient } from '@ordo/database';

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
import type { User } from '@ordo/database';
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