# Ordo - Task Management System

A modern task management system built with React, Drizzle ORM, and PGlite in a monorepo structure.

## Features

- 📋 **Task Management** - Create, update, and manage tasks
- 👥 **User Management** - Multi-user support with user profiles
- 🗄️ **Database** - Centralized database package with Drizzle ORM + PGlite
- 🎨 **UI Components** - Shared component library with shadcn/ui
- ⚡ **Fast Development** - Turbo-powered monorepo with hot reloading
- 💾 **Persistent Storage** - Browser-based PostgreSQL with IndexedDB persistence

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

The database package provides a type-safe database layer using:
- **Drizzle ORM** - Modern TypeScript ORM
- **PGlite** - Lightweight WASM PostgreSQL
- **Type Safety** - Full TypeScript support with inferred types

### Usage

```typescript
import { db, users, tasks, runMigrations } from '@ordo/database';

// Initialize database
await runMigrations();

// Create a user
const newUser = await db.insert(users).values({
  email: 'user@example.com',
  name: 'John Doe'
}).returning();
```

### Database Commands

```bash
# Build database package
cd packages/database && bun run build

# Run example/demo
cd packages/database && bun run src/example.ts

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
