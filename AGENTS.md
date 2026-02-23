# AGENTS.md - Development Guidelines for Ordo

## Project Overview

Ordo is a Turborepo monorepo with:
- **apps/web**: Vite + React web app with Cloudflare Workers, LiveStore, shadcn/ui
- **apps/engine**: Cloudflare Workers backend
- **apps/mobile**: React Native (Expo) mobile app
- **packages/engine-core**: Shared core logic
- **packages/sync-engine**: Sync engine package

Package manager: **Bun** (v1.2.17)
Node version: **>= 24.0.0**

---

## Build Commands

### Root Level (run from `/Users/mxdeley/madeleydesignstudio/ordo/ordo`)

```bash
# Build all packages
bun run build

# Start development servers
bun run dev

# Type check all packages
bun run typecheck

# Run all tests
bun run test

# Deploy to Cloudflare
bun run wrangler:deploy
```

### Web App (`apps/web`)

```bash
cd apps/web

# Development
bun run dev

# Build
bun run build

# Type check
bun run typecheck

# Deploy
bun run deploy
bun run deploy:prod

# Tests (Playwright)
bun run test                    # Run all tests
bunx playwright test --grep "test name"   # Run single test by name
bunx playwright test tests/example.spec.ts # Run specific test file
```

### Engine (`apps/engine`)

```bash
cd apps/engine
bun run dev                    # Local development
bun run build                  # Dry-run deployment
bun run typecheck
```

### Mobile (`apps/mobile`)

```bash
cd apps/mobile
bun run start                  # Start Expo
bun run typecheck
```

### Packages

```bash
cd packages/engine-core
bun run typecheck

cd packages/sync-engine
bun run typecheck
```

---

## Code Style Guidelines

### TypeScript Configuration

All packages use strict TypeScript with these key settings:
- `strict: true`
- `strictNullChecks: true`
- `noUncheckedIndexedAccess: true`
- `verbatimModuleSyntax: true`
- `moduleResolution: "bundler"`
- `allowImportingTsExtensions: true`
- `rewriteRelativeImportExtensions: true`

### Imports

**Always use `.ts` or `.tsx` extensions in imports:**
```typescript
// CORRECT
import { Footer } from './components/Footer.tsx'
import { schema } from './schema.ts'

// INCORRECT (will fail typecheck)
import { Footer } from './components/Footer'
```

**Use path aliases in web app:**
```typescript
// CORRECT - web app
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// CORRECT - packages and cross-app
import { something } from '@ordo/engine-core'
```

**Order imports:**
1. External dependencies (React, etc.)
2. Internal packages (@ordo/*)
3. Absolute aliases (@/*)
4. Relative imports (./)

### Naming Conventions

- **Components**: PascalCase (e.g., `Button.tsx`, `AlertDialog.tsx`)
- **Functions/Variables**: camelCase (e.g., `handleClick`, `isLoading`)
- **Constants**: UPPER_SNAKE_CASE for true constants
- **Types/Interfaces**: PascalCase with descriptive names
- **Observable queries**: Suffix with `$` (e.g., `todos$`, `uiState$`)

### Component Patterns

**Functional components with explicit return types:**
```typescript
export const MyComponent: React.FC = () => {
  return <div>...</div>
}
```

**Use `cn()` for className merging:**
```typescript
import { cn } from '@/lib/utils'

function Button({ className, ...props }: ButtonProps) {
  return (
    <button
      className={cn('base-classes', className)}
      {...props}
    />
  )
}
```

**Error boundaries with react-error-boundary:**
```typescript
import { ErrorBoundary } from 'react-error-boundary'

<ErrorBoundary fallback={<div>Error occurred</div>}>
  <Component />
</ErrorBoundary>
```

### LiveStore Patterns

**Query observables (suffix with $):**
```typescript
const incompleteCount$ = queryDb(
  tables.todos.count().where({ completed: false }),
  { label: 'incompleteCount' }
)
```

**Use hooks for store access:**
```typescript
const store = useAppStore()
const data = store.useQuery(query$)
```

**Event commits:**
```typescript
store.commit(events.todoCreated({ id, text }))
```

### Error Handling

- Use React Error Boundaries for component errors
- Prefer explicit error handling over silent failures
- Use TypeScript's strict null checks
- Avoid `any` types - use `unknown` with type guards

### React Patterns

- Use `useCallback` for event handlers passed to children
- Prefer functional components with hooks
- Use `Suspense` for async boundaries
- React 19 features available

---

## Testing

Tests use Playwright for web app E2E testing:

```bash
# Run all tests
bun run test

# Run specific test
bunx playwright test --grep "adds new todo"

# Run specific file
bunx playwright test tests/todo.spec.ts

# Debug mode
bunx playwright test --debug

# UI mode
bunx playwright test --ui
```

---

## Turbo Task Pipeline

See `turbo.json` for task dependencies:
- `build` depends on `^build` (upstream builds)
- `typecheck` depends on `^typecheck`
- `test` depends on `build`
- `wrangler:deploy` depends on `build`

Use `--filter` to run tasks for specific packages:
```bash
bunx turbo run build --filter=@ordo/web
bunx turbo run typecheck --filter=@ordo/engine
```

---

## Environment Variables

Web app uses Vite-style env vars (accessible via `import.meta.env`):
- `VITE_LIVESTORE_SYNC_URL`
- `VITE_LIVESTORE_STORE_ID`

Mobile uses Expo-style (accessible via `process.env`):
- `EXPO_PUBLIC_LIVESTORE_SYNC_URL`
- `EXPO_PUBLIC_LIVESTORE_STORE_ID`

---

## Workspace Dependencies

Always use `workspace:*` for internal packages:
```json
{
  "dependencies": {
    "@ordo/engine-core": "workspace:*",
    "@ordo/sync-engine": "workspace:*"
  }
}
```

---

## Shadcn/UI Components

Components are in `apps/web/src/components/ui/`:
- **DO NOT EDIT** these components - they are our design system from shadcn
- Built on `@base-ui/react`
- Use `cn()` from `@/lib/utils` for className merging
- Follow existing component patterns when adding new ones
- Import with `@/components/ui/[component-name]`

To add a new shadcn component:
```bash
cd apps/web
bunx --bun shadcn add [component-name]
```
