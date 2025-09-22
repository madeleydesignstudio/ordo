#!/usr/bin/env node

/**
 * ElectricSQL Configuration Checker
 *
 * This script helps validate your ElectricSQL Cloud configuration
 * and tests the connection to your Electric source.
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

// ANSI color codes
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bold}${colors.cyan}${msg}${colors.reset}`),
};

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return {};
  }

  try {
    const content = readFileSync(filePath, 'utf8');
    const env = {};

    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          env[key.trim()] = valueParts.join('=').trim();
        }
      }
    });

    return env;
  } catch (error) {
    log.error(`Failed to read ${filePath}: ${error.message}`);
    return {};
  }
}

function loadEnvironment() {
  const envFiles = [
    '.env',
    '.env.local',
    '.env.development',
  ];

  let env = {};

  for (const file of envFiles) {
    const filePath = join(projectRoot, file);
    const fileEnv = loadEnvFile(filePath);
    env = { ...env, ...fileEnv };

    if (Object.keys(fileEnv).length > 0) {
      log.info(`Loaded environment from ${file}`);
    }
  }

  return env;
}

async function testElectricConnection(config) {
  const { url, sourceId, secret } = config;

  try {
    const testUrl = new URL('/v1/shape', url);
    testUrl.searchParams.set('table', 'tasks');
    testUrl.searchParams.set('source_id', sourceId);
    testUrl.searchParams.set('secret', secret);
    testUrl.searchParams.set('offset', '0');
    testUrl.searchParams.set('limit', '1');

    log.info('Testing ElectricSQL connection...');

    const response = await fetch(testUrl.toString(), {
      method: 'GET',
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (response.ok) {
      const data = await response.json();
      log.success('ElectricSQL connection successful!');

      if (Array.isArray(data)) {
        log.info(`Found ${data.length} records in the initial response`);
      }

      return true;
    } else {
      log.error(`ElectricSQL connection failed with status: ${response.status}`);

      try {
        const errorData = await response.text();
        log.error(`Response: ${errorData}`);
      } catch (e) {
        log.error('Failed to read error response');
      }

      return false;
    }
  } catch (error) {
    log.error(`ElectricSQL connection error: ${error.message}`);
    return false;
  }
}

function validateConfig(env) {
  log.header('🔍 Configuration Validation');

  const required = [
    'VITE_ELECTRIC_URL',
    'VITE_ELECTRIC_SOURCE_ID',
    'VITE_ELECTRIC_SECRET',
  ];

  const optional = [
    'VITE_ELECTRIC_SYNC_ENABLED',
    'VITE_SYNC_BACKEND_URL',
  ];

  let isValid = true;

  // Check required variables
  for (const key of required) {
    if (env[key]) {
      log.success(`${key} is set`);
    } else {
      log.error(`${key} is missing or empty`);
      isValid = false;
    }
  }

  // Check optional variables
  for (const key of optional) {
    if (env[key]) {
      log.info(`${key}: ${env[key]}`);
    } else {
      log.warning(`${key} is not set (using default)`);
    }
  }

  // Validate specific values
  if (env.VITE_ELECTRIC_URL && !env.VITE_ELECTRIC_URL.startsWith('http')) {
    log.error('VITE_ELECTRIC_URL must be a valid HTTP/HTTPS URL');
    isValid = false;
  }

  if (env.VITE_ELECTRIC_SOURCE_ID && env.VITE_ELECTRIC_SOURCE_ID.length < 30) {
    log.warning('VITE_ELECTRIC_SOURCE_ID seems too short (should be a UUID)');
  }

  if (env.VITE_ELECTRIC_SECRET && env.VITE_ELECTRIC_SECRET.length < 50) {
    log.warning('VITE_ELECTRIC_SECRET seems too short');
  }

  if (env.VITE_ELECTRIC_SYNC_ENABLED === 'false') {
    log.warning('ElectricSQL sync is disabled (VITE_ELECTRIC_SYNC_ENABLED=false)');
  }

  return isValid;
}

function printSetupHelp() {
  log.header('📋 Setup Help');

  console.log(`
${colors.bold}To set up ElectricSQL Cloud:${colors.reset}

1. Sign up at: ${colors.cyan}https://console.electric-sql.com${colors.reset}
2. Add your Supabase database as a new source
3. Copy your Source ID and Secret
4. Create a .env.local file with:

${colors.green}VITE_ELECTRIC_URL=https://api.electric-sql.cloud
VITE_ELECTRIC_SOURCE_ID=your-source-id-here
VITE_ELECTRIC_SECRET=your-secret-here
VITE_ELECTRIC_SYNC_ENABLED=true${colors.reset}

5. Run this script again to validate

For detailed instructions, see: ${colors.cyan}scripts/setup-electric.md${colors.reset}
`);
}

async function main() {
  console.log(`${colors.bold}${colors.magenta}ElectricSQL Configuration Checker${colors.reset}\n`);

  const env = loadEnvironment();

  if (Object.keys(env).length === 0) {
    log.warning('No environment files found');
    printSetupHelp();
    process.exit(1);
  }

  const isConfigValid = validateConfig(env);

  if (!isConfigValid) {
    log.error('\nConfiguration validation failed');
    printSetupHelp();
    process.exit(1);
  }

  // Test connection if all required vars are present
  if (env.VITE_ELECTRIC_URL && env.VITE_ELECTRIC_SOURCE_ID && env.VITE_ELECTRIC_SECRET) {
    log.header('🌐 Connection Test');

    const connectionSuccess = await testElectricConnection({
      url: env.VITE_ELECTRIC_URL,
      sourceId: env.VITE_ELECTRIC_SOURCE_ID,
      secret: env.VITE_ELECTRIC_SECRET,
    });

    if (connectionSuccess) {
      log.header('🎉 All Good!');
      log.success('Your ElectricSQL configuration is working correctly');

      if (env.VITE_SYNC_BACKEND_URL) {
        log.info(`Backend sync URL: ${env.VITE_SYNC_BACKEND_URL}`);
      }

      console.log(`\n${colors.bold}Next steps:${colors.reset}
- Start your development server: ${colors.cyan}bun run dev${colors.reset}
- Check the ElectricSQL Sync Status in the web app
- Test bidirectional sync by creating tasks`);
    } else {
      log.header('❌ Connection Failed');
      log.error('Please check your ElectricSQL Cloud configuration');
      console.log(`
${colors.bold}Common issues:${colors.reset}
- Incorrect Source ID or Secret
- Network connectivity problems
- Electric Cloud service issues
- Database not properly connected to Electric Cloud

Check the Electric Cloud console: ${colors.cyan}https://console.electric-sql.com${colors.reset}
`);
      process.exit(1);
    }
  }
}

// Run the script
main().catch(error => {
  log.error(`Script failed: ${error.message}`);
  process.exit(1);
});
