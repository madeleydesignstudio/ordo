# Scripts

This directory contains utility scripts for the Turborepo workspace.

## Cache Cleaner

The `clean-cache.ts` script helps you clean all caches, node_modules, and build artifacts across your monorepo.

### Features

- 🧹 **Comprehensive cleaning**: Removes node_modules, lock files, build artifacts
- 🌐 **Global cache cleaning**: Clears bun, npm, and yarn caches
- 🔍 **Dry-run mode**: See what would be deleted without actually deleting
- 💻 **Deep cleaning**: Optional removal of IDE and OS files
- 🎯 **Workspace-aware**: Cleans all packages in the monorepo

### Usage

```bash
# Clean all caches and dependencies
bun run clean:cache

# See what would be cleaned (dry run)
bun run clean:cache:dry

# Deep clean including IDE/OS files
bun run clean:cache:deep

# Manual options
bun run scripts/clean-cache.ts --verbose --deep
```

### What it cleans

- **Dependencies**: `node_modules`, lock files (`bun.lockb`, `package-lock.json`, etc.)
- **Global caches**: Bun, npm, and yarn caches
- **Build artifacts**: `.next`, `.turbo`, `dist`, `build`, `.wrangler`, `.vercel`, `.netlify`
- **TypeScript**: `*.tsbuildinfo` files
- **IDE/OS files** (with `--deep`): `.DS_Store`, `.idea`, `Thumbs.db`, etc.

## Dependency Updater

The `update-dependencies.ts` script helps you keep all dependencies across your monorepo up to date.

### Features

- 🔍 **Workspace-aware**: Automatically finds all packages in your Turborepo
- 📦 **Multi-package support**: Updates root, apps, and packages dependencies
- 🎯 **Selective updates**: Skip workspace dependencies (they're managed internally)
- 🤝 **Interactive mode**: Choose which packages to update
- 📋 **Check-only mode**: See what updates are available without installing
- 🚀 **Fast**: Uses Bun for package management

### Usage

```bash
# Update all dependencies across the workspace
bun run update:deps

# Only check for updates (don't install)
bun run update:deps:check

# Interactive mode - prompt for each package
bun run update:deps:interactive

# Clean cache first, then update
bun run update:deps:clean

# Include prerelease versions
bun run scripts/update-dependencies.ts --prerelease

# Clean first, then update with options
bun run scripts/update-dependencies.ts --clean-first --interactive

# Show help
bun run scripts/update-dependencies.ts --help
```

### What it does

1. **Scans workspace**: Finds all `package.json` files in:
   - Root directory
   - `apps/*` directories
   - `packages/*` directories

2. **Checks versions**: For each package, compares current versions with latest stable versions from npm

3. **Updates dependencies**: Uses `bun update` to install the latest versions

4. **Skips workspace deps**: Ignores `workspace:*` dependencies since they're managed by the monorepo

### Options

- `--check-only`: Only check for updates, don't install them
- `--interactive`: Prompt before updating each package
- `--prerelease`: Include beta/alpha versions in checks
- `--clean-first`: Clean cache and node_modules before updating
- `--help`: Show help message

### Example Output

```
🚀 Turborepo Dependency Updater

🔍 Scanning workspace for packages...

Found 4 packages:

📦 shadcn-ui-monorepo
   Path: package.json
   📋 Found 2 updates available:
      turbo: ^2.4.2 → 2.5.0
      typescript: 5.7.3 → 5.8.0
   🔄 Updating dependencies...
   ✅ Updated successfully

📦 @workspace/ui
   Path: packages/ui/package.json
   ✅ All dependencies are up to date

📦 dashboard
   Path: apps/dashboard/package.json
   📋 Found 1 updates available:
      next: ^15.1.3 → 15.2.0
   🔄 Updating dependencies...
   ✅ Updated successfully

✅ Dependency update check complete!
```

### Safety Features

- **Workspace preservation**: Never touches `workspace:*` dependencies
- **Error handling**: Gracefully handles network issues or missing packages
- **Dry-run mode**: Use `--check-only` to see what would be updated
- **Interactive confirmation**: Use `--interactive` to approve each update

### Requirements

- Bun package manager
- Node.js >= 20
- Internet connection (to check npm registry) 