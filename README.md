# Ordo - Simple Task Manager

A clean and simple task management application built with React, Drizzle ORM, and PGlite in a monorepo structure.

## Features

- 📋 **Simple Task Management** - Create, update, delete, and complete tasks
- 💾 **Persistent Storage** - Browser-based PostgreSQL with IndexedDB persistence
- 🗄️ **Type-Safe Database** - Centralized database package with Drizzle ORM + PGlite
- 🎨 **Clean UI** - Simple, focused interface without unnecessary complexity
- ⚡ **Fast Development** - Turbo-powered monorepo with hot reloading
- 🧹 **No Setup Required** - Starts with an empty database, no seeding needed

## Project Structure

```
ordo/
├── apps/
│   ├── web/           # Main React application
│   └── marketing/     # Marketing website
├── packages/
│   ├── database/      # Centralized database package (Drizzle + PGlite)
│   ├── ui/           # Shared UI components
│   └── typescript-config/ # Shared TypeScript configuration
└── ...
```

## Quick Start

1. **Install dependencies:**
```bash
bun install
```

2. **Start development:**
```bash
bun run dev
```

3. **Build for production:**
```bash
bun run build
```

## Database Package (@ordo/database)

The database package provides a simple, type-safe database layer using:
- **Drizzle ORM** - Modern TypeScript ORM
- **PGlite** - Lightweight WASM PostgreSQL with IndexedDB persistence
- **Single Table** - Just tasks, keeping it simple
- **Type Safety** - Full TypeScript support with inferred types

### Usage

```typescript
import { createDatabaseWithClient, tasks, runMigrations } from '@ordo/database';
import { usePGlite } from '@electric-sql/pglite-react';

// In a React component
const pgliteClient = usePGlite();
const db = createDatabaseWithClient(pgliteClient);

// Initialize database (creates empty tasks table)
await runMigrations(pgliteClient);

// Create a task
const newTask = await db.insert(tasks).values({
  title: 'Complete setup',
  description: 'Finish setting up the task manager'
}).returning();
```

### Database Commands

```bash
# Build database package
cd packages/database && bun run build

# Generate migrations (if needed)
cd packages/database && bun run generate
```

## UI Components

### Adding shadcn/ui components

To add components to your app, run the following command at the root of your `web` app:

```bash
bun dlx shadcn@latest add button -c apps/web
```

This will place the ui components in the `packages/ui/src/components` directory.

### Using components

Import components from the `ui` package:

```tsx
import { Button } from "@ordo/ui/components/button"
```

## Development

### Available Scripts

```bash
# Development
bun run dev          # Start all apps in development mode
bun run build        # Build all packages and apps
bun run lint         # Lint all packages
bun run format       # Format all files

# Database specific
bun run db:generate  # Generate database migrations
bun run db:push      # Push schema changes
bun run db:studio    # Open Drizzle Studio
```

### Package Manager

This project uses **Bun** as the package manager. Make sure you have Bun installed:

```bash
curl -fsSL https://bun.sh/install | bash
```

## Architecture

- **Apps**: Contains the main applications (web, marketing)
- **Packages**: Shared packages used across apps
- **Database**: Centralized database layer with schema management
- **UI**: Shared component library
- **TypeScript**: Shared TypeScript configurations

## Contributing

1. Clone the repository
2. Install dependencies: `bun install`
3. Start development: `bun run dev`
4. Make your changes
5. Build and test: `bun run build`
