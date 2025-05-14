# Ordo

A modern monorepo setup with a dashboard and marketing site using shared UI components.

## Project Structure

- **apps/dashboard**: A React 19 application with TanStack Router, React Query, and shadcn/ui
- **apps/marketing**: A Next.js 15 marketing site 
- **packages/ui**: Shared UI components (powered by shadcn/ui)
- **packages/eslint-config**: Shared ESLint configurations
- **packages/typescript-config**: Shared TypeScript configurations

## Getting Started

1. Install dependencies:

```bash
pnpm install
```

2. Set up environment variables:
   - For the dashboard app, create a `.env` file in `apps/dashboard` based on its `.env.example`

3. Set up the database (for dashboard app):

```bash
cd apps/dashboard
pnpm db push
```

4. Start the development server:

```bash
# From project root
pnpm dev
```

This will start both the dashboard (http://localhost:3001) and marketing (http://localhost:3000) applications.

## Apps

### Dashboard

A feature-rich admin dashboard built with:
- [React 19](https://react.dev) + [React Compiler](https://react.dev/learn/react-compiler)
- TanStack [Start](https://tanstack.com/start/latest) + [Router](https://tanstack.com/router/latest) + [Query](https://tanstack.com/query/latest)
- [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [Drizzle ORM](https://orm.drizzle.team/) + PostgreSQL
- [Better Auth](https://www.better-auth.com/)

See the [dashboard README](apps/dashboard/README.md) for more specific setup and usage information.

### Marketing

A marketing website built with:
- Next.js 15
- React 19
- shadcn/ui components with Tailwind CSS

## Shared Components

The `packages/ui` directory contains shared UI components that are used across both applications. These components are built with shadcn/ui and Tailwind CSS.

To add new components, run:

```bash
# From the project root
cd packages/ui
pnpm dlx shadcn@latest add [component-name]
```

These components can then be imported in either app:

```tsx
import { Button } from "@workspace/ui/components/button"
```

## Scripts

### Root Scripts

- `pnpm dev`: Start all applications in development mode
- `pnpm build`: Build all applications
- `pnpm lint`: Lint all applications
- `pnpm format`: Format code with Prettier

### Dashboard Scripts

- `pnpm db`: Run drizzle-kit commands
- `pnpm ui`: Run the shadcn/ui CLI
- `pnpm auth`: Run Better Auth CLI
- `pnpm auth:generate`: Regenerate auth schema

## Notes

### Known Issues

- React Compiler is still in beta. You can disable it in the dashboard's `app.config.ts` if needed.
- TanStack Start is in beta and may undergo major changes.

### Building for Production

See the [TanStack Start hosting docs](https://tanstack.com/start/latest/docs/framework/react/hosting) for information on deploying the dashboard app.
