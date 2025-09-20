#!/usr/bin/env node

/**
 * Simple Node.js server for testing true offline-first PWA
 * This server serves static files and can be used to test offline functionality
 */

import { createServer } from 'http';
import { readFile, stat, readdir } from 'fs/promises';
import { extname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const DIST_DIR = resolve(__dirname, '../dist');
const PORT = process.env.PORT || 3000;

// MIME type mapping
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wasm': 'application/wasm',
  '.data': 'application/octet-stream',
  '.webmanifest': 'application/manifest+json'
};

async function serveFile(filePath, res) {
  try {
    const stats = await stat(filePath);

    if (stats.isDirectory()) {
      // Try to serve index.html from directory
      const indexPath = join(filePath, 'index.html');
      try {
        await stat(indexPath);
        return serveFile(indexPath, res);
      } catch {
        // Directory listing not allowed - serve index.html fallback
        return serveFile(join(DIST_DIR, 'index.html'), res);
      }
    }

    const ext = extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    const content = await readFile(filePath);

    // Set headers for PWA and caching
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', content.length);

    // Enable CORS for development
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // PWA-friendly headers
    if (ext === '.webmanifest') {
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day
    } else if (ext === '.js' || ext === '.css') {
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year for hashed assets
    } else if (ext === '.wasm' || ext === '.data') {
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year for WASM
    } else {
      res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour default
    }

    res.writeHead(200);
    res.end(content);

  } catch (error) {
    console.error('Error serving file:', filePath, error.message);

    // Fallback to index.html for SPA routing
    if (filePath !== join(DIST_DIR, 'index.html')) {
      return serveFile(join(DIST_DIR, 'index.html'), res);
    }

    // Ultimate fallback
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('File not found');
  }
}

const server = createServer(async (req, res) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);

  // Handle OPTIONS requests for CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== 'GET') {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method not allowed');
    return;
  }

  let filePath = req.url;

  // Remove query string
  if (filePath.includes('?')) {
    filePath = filePath.split('?')[0];
  }

  // Security: prevent directory traversal
  if (filePath.includes('..')) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Bad request');
    return;
  }

  // Default to index.html for root
  if (filePath === '/' || filePath === '') {
    filePath = '/index.html';
  }

  // Remove leading slash
  if (filePath.startsWith('/')) {
    filePath = filePath.slice(1);
  }

  const fullPath = join(DIST_DIR, filePath);
  await serveFile(fullPath, res);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});

// Start server
server.listen(PORT, () => {
  console.log('🚀 Ordo Todo App - Offline-First Server');
  console.log('=====================================');
  console.log(`📱 Server running at http://localhost:${PORT}`);
  console.log(`📁 Serving from: ${DIST_DIR}`);
  console.log('');
  console.log('🧪 To test TRUE OFFLINE functionality:');
  console.log('  1. Visit http://localhost:${PORT} and install PWA');
  console.log('  2. Close browser completely');
  console.log('  3. Disconnect ALL network connections');
  console.log('  4. Launch PWA from desktop - should work offline!');
  console.log('');
  console.log('Press Ctrl+C to stop');
});

// Check if dist directory exists
try {
  await stat(DIST_DIR);
  console.log(`✅ Serving from dist directory: ${DIST_DIR}`);
} catch {
  console.error(`❌ Dist directory not found: ${DIST_DIR}`);
  console.error('Run "bun run build:static" first to create the dist directory');
  process.exit(1);
}
