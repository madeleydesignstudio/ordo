#!/usr/bin/env bun

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { glob } from 'glob';

interface PackageJson {
  name: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

interface UpdateOptions {
  checkOnly?: boolean;
  interactive?: boolean;
  includePrerelease?: boolean;
  cleanFirst?: boolean;
}

class DependencyUpdater {
  private workspaceRoot: string;
  private options: UpdateOptions;

  constructor(options: UpdateOptions = {}) {
    this.workspaceRoot = process.cwd();
    this.options = options;
  }

  async run() {
    if (this.options.cleanFirst) {
      console.log('🧹 Cleaning cache first...\n');
      await this.cleanCache();
      console.log('');
    }

    console.log('🔍 Scanning workspace for packages...\n');
    
    const packagePaths = await this.findPackages();
    console.log(`Found ${packagePaths.length} packages:\n`);
    
    for (const packagePath of packagePaths) {
      await this.processPackage(packagePath);
    }
    
    console.log('\n✅ Dependency update check complete!');
  }

  private async findPackages(): Promise<string[]> {
    const patterns = [
      'package.json',           // Root package
      'apps/*/package.json',    // Apps
      'packages/*/package.json' // Packages
    ];
    
    const packageFiles: string[] = [];
    
    for (const pattern of patterns) {
      const matches = glob.sync(pattern, { cwd: this.workspaceRoot });
      packageFiles.push(...matches);
    }
    
    return packageFiles.map(file => join(this.workspaceRoot, file));
  }

  private async processPackage(packagePath: string) {
    if (!existsSync(packagePath)) return;
    
    const packageJson: PackageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
    const packageDir = packagePath.replace('/package.json', '');
    const relativePath = packagePath.replace(this.workspaceRoot + '/', '');
    
    console.log(`📦 ${packageJson.name || relativePath}`);
    console.log(`   Path: ${relativePath}`);
    
    const updates: string[] = [];
    
    // Check dependencies
    if (packageJson.dependencies) {
      const depUpdates = await this.checkDependencies(
        packageJson.dependencies, 
        'dependencies',
        packageDir
      );
      updates.push(...depUpdates);
    }
    
    // Check devDependencies
    if (packageJson.devDependencies) {
      const devDepUpdates = await this.checkDependencies(
        packageJson.devDependencies, 
        'devDependencies',
        packageDir
      );
      updates.push(...devDepUpdates);
    }
    
    if (updates.length === 0) {
      console.log('   ✅ All dependencies are up to date\n');
    } else {
      console.log(`   📋 Found ${updates.length} updates available:`);
      updates.forEach(update => console.log(`      ${update}`));
      
      if (!this.options.checkOnly) {
        if (this.options.interactive) {
          const shouldUpdate = await this.promptForUpdate(packageJson.name || relativePath);
          if (shouldUpdate) {
            await this.updatePackage(packageDir);
          }
        } else {
          await this.updatePackage(packageDir);
        }
      }
      console.log('');
    }
  }

  private async checkDependencies(
    dependencies: Record<string, string>, 
    type: string,
    packageDir: string
  ): Promise<string[]> {
    const updates: string[] = [];
    
    for (const [name, currentVersion] of Object.entries(dependencies)) {
      // Skip workspace dependencies
      if (currentVersion.startsWith('workspace:')) continue;
      
      try {
        const latestVersion = await this.getLatestVersion(name);
        const cleanCurrent = this.cleanVersion(currentVersion);
        
        if (cleanCurrent !== latestVersion) {
          updates.push(`${name}: ${currentVersion} → ${latestVersion}`);
        }
      } catch (error) {
        console.log(`   ⚠️  Could not check ${name}: ${error}`);
      }
    }
    
    return updates;
  }

  private async getLatestVersion(packageName: string): Promise<string> {
    try {
      const command = this.options.includePrerelease 
        ? `npm view ${packageName} version --json`
        : `npm view ${packageName} version`;
        
      const result = execSync(command, { 
        encoding: 'utf8', 
        stdio: ['pipe', 'pipe', 'pipe'] 
      });
      
      return result.trim().replace(/"/g, '');
    } catch (error) {
      throw new Error(`Failed to fetch version for ${packageName}`);
    }
  }

  private cleanVersion(version: string): string {
    // Remove ^ ~ and other prefixes to get exact version
    return version.replace(/^[\^~>=<]/, '');
  }

  private async updatePackage(packageDir: string) {
    console.log(`   🔄 Updating dependencies...`);
    
    try {
      // Use bun to update dependencies
      execSync('bun update', { 
        cwd: packageDir, 
        stdio: 'inherit' 
      });
      console.log(`   ✅ Updated successfully`);
    } catch (error) {
      console.log(`   ❌ Update failed: ${error}`);
    }
  }

  private async promptForUpdate(packageName: string): Promise<boolean> {
    // Simple prompt implementation
    process.stdout.write(`   Update ${packageName}? (y/N): `);
    
    return new Promise((resolve) => {
      process.stdin.once('data', (data) => {
        const answer = data.toString().trim().toLowerCase();
        resolve(answer === 'y' || answer === 'yes');
      });
    });
  }

  private async cleanCache() {
    try {
      // Run the cache cleaning script
      execSync('bun run scripts/clean-cache.ts', { 
        cwd: this.workspaceRoot, 
        stdio: 'inherit' 
      });
    } catch (error) {
      console.log(`   ❌ Cache cleaning failed: ${error}`);
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  
  const options: UpdateOptions = {
    checkOnly: args.includes('--check-only'),
    interactive: args.includes('--interactive'),
    includePrerelease: args.includes('--prerelease'),
    cleanFirst: args.includes('--clean-first')
  };

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🚀 Turborepo Dependency Updater

Usage: bun run update:deps [options]

Options:
  --check-only     Only check for updates, don't install them
  --interactive    Prompt before updating each package
  --prerelease     Include prerelease versions
  --clean-first    Clean cache and node_modules before updating
  --help, -h       Show this help message

Examples:
  bun run update:deps                    # Update all dependencies
  bun run update:deps --check-only       # Only check for updates
  bun run update:deps --interactive      # Prompt for each update
  bun run update:deps --prerelease       # Include beta/alpha versions
  bun run update:deps --clean-first      # Clean cache first, then update
`);
    process.exit(0);
  }

  console.log('🚀 Turborepo Dependency Updater\n');
  
  if (options.checkOnly) {
    console.log('📋 Check-only mode: Will not install updates\n');
  }
  
  if (options.interactive) {
    console.log('🤝 Interactive mode: Will prompt for each update\n');
  }

  const updater = new DependencyUpdater(options);
  await updater.run();
}

// Run the main function
main().catch(console.error); 