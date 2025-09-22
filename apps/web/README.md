# @ordo/web - React + TypeScript + Vite

This is a React application built with Vite, TypeScript, and integrated with the Ordo monorepo using Biome for linting and formatting.

## Features

- **React 19** with TypeScript
- **Vite** for fast development and building
- **SWC** for Fast Refresh via [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc)
- **PWA** with offline support via [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
- **PGlite Database** with Drizzle ORM for local data persistence
- **Biome** for linting, formatting, and import organization
- **Shared TypeScript configuration** from `@ordo/typescript-config`

## Environment Configuration

This app uses environment variables to configure the sync backend URL:

### Environment Files

- `.env` - Default development configuration
- `.env.local` - Local overrides (ignored by git)
- `.env.production` - Production configuration
- `.env.example` - Example configuration file

### Environment Variables

- `VITE_SYNC_BACKEND_URL` - URL of the sync backend server
  - Development: `http://localhost:3001`
  - Production: `https://ordo-sync-backend.vercel.app`

### Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your local settings if needed.

## Development

```bash
# Start development server
bun run dev

# Build for production
bun run build

# Build for production with production env
bun run build:prod

# Preview production build
bun run preview

# Lint code
bun run lint

# Format code
bun run format

# Lint, format, and organize imports
bun run check
```

## Sync Integration

This app integrates with the Ordo sync backend for cloud synchronization:
- **Environment-based Configuration**: Automatically uses the correct backend URL based on build environment
- **Smart Sync**: Network-aware synchronization that gracefully handles offline scenarios
- **Background Sync**: Automatic synchronization when network connectivity is restored

## Progressive Web App

This app is configured as a PWA with:
- **Offline Support**: Automatic caching of assets for offline functionality
- **Installable**: Can be installed as a native app on supported devices
- **Auto-updating**: Service worker automatically updates when new versions are available

## Local Database

This app uses [PGlite](https://pglite.dev/) with [Drizzle ORM](https://orm.drizzle.team/) for local data persistence:
- **PGlite**: WASM Postgres that runs in the browser with IndexedDB persistence
- **Drizzle ORM**: Type-safe database queries and schema management
- **Offline-first**: All data is stored locally and works completely offline

## Code Quality

This app uses [Biome](https://biomejs.dev/) for:
- **Linting**: Fast and accurate code analysis
- **Formatting**: Consistent code style
- **Import Organization**: Automatic import sorting and cleanup

The configuration is inherited from the monorepo root `biome.json`.
