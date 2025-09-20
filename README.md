# Ordo - Offline-First Todo App

A modern, offline-first todo application built with React, PGlite, and PWA technologies. Features automatic update notifications and seamless offline functionality.

## Features

- ✅ **Offline-First**: Works completely offline with PGlite
- 🚀 **Automatic Updates**: Smart deployment detection with user-friendly notifications
- 📱 **PWA Ready**: Install as a native app on any device
- 🎨 **Modern UI**: Built with Tailwind CSS and shadcn/ui components
- ⚡ **Fast**: Vite-powered development and build process

## Quick Start

```bash
# Install dependencies
bun install

# Start development server
bun dev

# Build for production
bun run build
```

## Adding components

To add components to your app, run the following command at the root of your `web` app:

```bash
bunx shadcn@latest add button -c apps/web
```

This will place the ui components in the `packages/ui/src/components` directory.

## Tailwind

Your `tailwind.config.ts` and `globals.css` are already set up to use the components from the `ui` package.

## Using components

To use the components in your app, import them from the `ui` package.

```tsx
import { Button } from "@ordo/ui/components/button"
```

## Update Notification System

This app includes an advanced update notification system that automatically detects when new deployments are available:

### How It Works

1. **Build-time Version Generation**: Each build creates a unique `version.json` file
2. **Client-side Monitoring**: App checks for updates every 30 seconds and when tab regains focus
3. **User-friendly Notifications**: Pop-up appears when updates are detected
4. **Smart Cache Management**: Forces complete cache refresh to ensure latest version

### Features

- 🔄 **Automatic Detection**: Monitors for both deployment and PWA updates
- 💬 **User Choice**: Users can refresh immediately or dismiss temporarily
- 🧹 **Cache Clearing**: Comprehensive cache invalidation including service workers
- ⏰ **Smart Timing**: Checks on focus, visibility changes, and periodic intervals
- 📱 **Status Indicator**: Subtle loading indicator during update checks

### Testing Updates

To test the update notification system:

```bash
# Generate a new version file to simulate deployment
node apps/web/test-update.js

# Then open your app and switch tabs or wait 30 seconds
```

For detailed documentation, see [UPDATE_SYSTEM.md](apps/web/UPDATE_SYSTEM.md).
