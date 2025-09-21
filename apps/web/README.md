# @ordo/web - React + TypeScript + Vite

This is a React application built with Vite, TypeScript, and integrated with the Ordo monorepo using Biome for linting and formatting.

## Features

- **React 19** with TypeScript
- **Vite** for fast development and building
- **SWC** for Fast Refresh via [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc)
- **PWA** with offline support via [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
- **Biome** for linting, formatting, and import organization
- **Shared TypeScript configuration** from `@ordo/typescript-config`

## Development

```bash
# Start development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview

# Lint code
bun run lint

# Format code
bun run format

# Lint, format, and organize imports
bun run check
```

## Progressive Web App

This app is configured as a PWA with:
- **Offline Support**: Automatic caching of assets for offline functionality
- **Installable**: Can be installed as a native app on supported devices
- **Auto-updating**: Service worker automatically updates when new versions are available

## Code Quality

This app uses [Biome](https://biomejs.dev/) for:
- **Linting**: Fast and accurate code analysis
- **Formatting**: Consistent code style
- **Import Organization**: Automatic import sorting and cleanup

The configuration is inherited from the monorepo root `biome.json`.
