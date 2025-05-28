#!/usr/bin/env bun

import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { join } from 'path';
import { glob } from 'glob';

interface CleanOptions {
  dryRun?: boolean;
  verbose?: boolean;
  deep?: boolean;
}

class CacheCleaner {
  private workspaceRoot: string;
  private options: CleanOptions;

  constructor(options: CleanOptions = {}) {
    this.workspaceRoot = process.cwd();
    this.options = options;
  }

  async run() {
    console.log('🧹 Cleaning workspace cache and dependencies...\n');
    
    if (this.options.dryRun) {
      console.log('🔍 Dry run mode: Will show what would be deleted\n');
    }

    // Clean package directories
    await this.cleanPackageDirectories();
    
    // Clean global caches
    await this.cleanGlobalCaches();
    
    // Clean build artifacts
    await this.cleanBuildArtifacts();
    
    // Clean IDE and OS files
    if (this.options.deep) {
      await this.cleanIDEAndOSFiles();
    }
    
    console.log('\n✅ Cache cleaning complete!');
    
    if (!this.options.dryRun) {
      console.log('\n💡 Run "bun install" to reinstall dependencies');
    }
  }

  private async cleanPackageDirectories() {
    console.log('📦 Cleaning package directories...');
    
    const patterns = [
      'node_modules',           // Root node_modules
      'apps/*/node_modules',    // App node_modules
      'packages/*/node_modules' // Package node_modules
    ];
    
    for (const pattern of patterns) {
      const matches = glob.sync(pattern, { cwd: this.workspaceRoot });
      
      for (const match of matches) {
        const fullPath = join(this.workspaceRoot, match);
        await this.removeDirectory(fullPath, 'node_modules');
      }
    }

    // Clean lock files
    const lockFiles = [
      'bun.lockb',
      'package-lock.json',
      'yarn.lock',
      'pnpm-lock.yaml',
      'apps/*/bun.lockb',
      'apps/*/package-lock.json',
      'apps/*/yarn.lock',
      'apps/*/pnpm-lock.yaml',
      'packages/*/bun.lockb',
      'packages/*/package-lock.json',
      'packages/*/yarn.lock',
      'packages/*/pnpm-lock.yaml'
    ];

    for (const pattern of lockFiles) {
      const matches = glob.sync(pattern, { cwd: this.workspaceRoot });
      
      for (const match of matches) {
        const fullPath = join(this.workspaceRoot, match);
        await this.removeFile(fullPath, 'lock file');
      }
    }
  }

  private async cleanGlobalCaches() {
    console.log('🌐 Cleaning global caches...');
    
    const cacheCommands = [
      { name: 'Bun cache', command: 'bun pm cache rm' },
      { name: 'npm cache', command: 'npm cache clean --force' },
      { name: 'Yarn cache', command: 'yarn cache clean' }
    ];

    for (const { name, command } of cacheCommands) {
      try {
        if (this.options.dryRun) {
          console.log(`   🔍 Would run: ${command}`);
        } else {
          if (this.options.verbose) {
            console.log(`   🔄 Running: ${command}`);
          }
          execSync(command, { 
            stdio: this.options.verbose ? 'inherit' : 'pipe',
            cwd: this.workspaceRoot 
          });
          console.log(`   ✅ Cleaned ${name}`);
        }
      } catch (error) {
        if (this.options.verbose) {
          console.log(`   ⚠️  Could not clean ${name}: ${error}`);
        }
      }
    }
  }

  private async cleanBuildArtifacts() {
    console.log('🏗️  Cleaning build artifacts...');
    
    const buildPatterns = [
      '.next',
      '.turbo',
      'dist',
      'build',
      '.wrangler',
      '.vercel',
      '.netlify',
      'apps/*/.next',
      'apps/*/.turbo',
      'apps/*/dist',
      'apps/*/build',
      'apps/*/.wrangler',
      'apps/*/.vercel',
      'apps/*/.netlify',
      'packages/*/.turbo',
      'packages/*/dist',
      'packages/*/build'
    ];

    for (const pattern of buildPatterns) {
      const matches = glob.sync(pattern, { cwd: this.workspaceRoot });
      
      for (const match of matches) {
        const fullPath = join(this.workspaceRoot, match);
        await this.removeDirectory(fullPath, 'build artifact');
      }
    }

    // Clean TypeScript build info
    const tsBuildInfo = [
      '*.tsbuildinfo',
      'apps/*/*.tsbuildinfo',
      'packages/*/*.tsbuildinfo'
    ];

    for (const pattern of tsBuildInfo) {
      const matches = glob.sync(pattern, { cwd: this.workspaceRoot });
      
      for (const match of matches) {
        const fullPath = join(this.workspaceRoot, match);
        await this.removeFile(fullPath, 'TypeScript build info');
      }
    }
  }

  private async cleanIDEAndOSFiles() {
    console.log('💻 Cleaning IDE and OS files...');
    
    const idePatterns = [
      '.vscode/settings.json',
      '.idea',
      '*.swp',
      '*.swo',
      '*~',
      '.DS_Store',
      'Thumbs.db',
      'apps/*/.DS_Store',
      'apps/*/Thumbs.db',
      'packages/*/.DS_Store',
      'packages/*/Thumbs.db'
    ];

    for (const pattern of idePatterns) {
      const matches = glob.sync(pattern, { cwd: this.workspaceRoot });
      
      for (const match of matches) {
        const fullPath = join(this.workspaceRoot, match);
        if (existsSync(fullPath)) {
          await this.removeFile(fullPath, 'IDE/OS file');
        }
      }
    }
  }

  private async removeDirectory(path: string, type: string) {
    if (!existsSync(path)) return;
    
    if (this.options.dryRun) {
      console.log(`   🔍 Would remove ${type}: ${path}`);
      return;
    }

    try {
      rmSync(path, { recursive: true, force: true });
      console.log(`   🗑️  Removed ${type}: ${path}`);
    } catch (error) {
      console.log(`   ❌ Failed to remove ${path}: ${error}`);
    }
  }

  private async removeFile(path: string, type: string) {
    if (!existsSync(path)) return;
    
    if (this.options.dryRun) {
      console.log(`   🔍 Would remove ${type}: ${path}`);
      return;
    }

    try {
      rmSync(path, { force: true });
      console.log(`   🗑️  Removed ${type}: ${path}`);
    } catch (error) {
      console.log(`   ❌ Failed to remove ${path}: ${error}`);
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  
  const options: CleanOptions = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose'),
    deep: args.includes('--deep')
  };

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🧹 Turborepo Cache Cleaner

Usage: bun run clean:cache [options]

Options:
  --dry-run        Show what would be deleted without actually deleting
  --verbose        Show detailed output
  --deep           Also clean IDE and OS files (.DS_Store, .idea, etc.)
  --help, -h       Show this help message

What gets cleaned:
  📦 Dependencies:     node_modules, lock files
  🌐 Global caches:    bun, npm, yarn caches
  🏗️  Build artifacts: .next, .turbo, dist, build, .wrangler
  💻 IDE/OS files:     .DS_Store, .idea, Thumbs.db (with --deep)

Examples:
  bun run clean:cache                    # Clean all caches
  bun run clean:cache --dry-run          # See what would be cleaned
  bun run clean:cache --deep             # Include IDE/OS files
  bun run clean:cache --verbose          # Show detailed output
`);
    process.exit(0);
  }

  console.log('🧹 Turborepo Cache Cleaner\n');
  
  const cleaner = new CacheCleaner(options);
  await cleaner.run();
}

// Run the main function
main().catch(console.error); 