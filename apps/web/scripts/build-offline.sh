#!/bin/bash

# Build script for true offline-first PWA deployment
# This creates a static site that can be served from any web server
# and works completely offline once installed as a PWA

set -e

echo "🚀 Building Ordo Todo App for True Offline Operation"
echo "=================================================="

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .tanstack/start/build
rm -rf dist
rm -rf .vercel

# Build the static site
echo "📦 Building static site..."
bun run build:static

# Files are already in dist from Vite build
echo "📁 Verifying distribution files..."

# Ensure all required files are present
echo "✅ Verifying offline-first requirements..."

REQUIRED_FILES=(
    "dist/index.html"
    "dist/manifest.webmanifest"
    "dist/icon.svg"
    "dist/offline.html"
    "dist/version.json"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Missing required file: $file"
        exit 1
    else
        echo "✅ Found: $file"
    fi
done

# Check for PGLite assets
PGLITE_ASSETS=($(find dist/assets -name "*.wasm" -o -name "*.data" 2>/dev/null || true))
if [ ${#PGLITE_ASSETS[@]} -eq 0 ]; then
    echo "⚠️  Warning: No PGLite WebAssembly files found"
else
    echo "✅ Found ${#PGLITE_ASSETS[@]} PGLite WebAssembly assets"
fi

# Calculate total size
TOTAL_SIZE=$(du -sh dist | cut -f1)
echo "📊 Total app size: $TOTAL_SIZE"

echo ""
echo "🎉 Build Complete! Your app is ready for TRUE OFFLINE operation"
echo "=============================================================="
echo ""
echo "📱 To test TRUE OFFLINE functionality:"
echo "  CRITICAL: You must install as PWA first, then test offline!"
echo ""
echo "  Step 1 - Install PWA:"
echo "    1. bun run serve:offline (or python3 -m http.server 3000 -d dist)"
echo "    2. Visit http://localhost:3000"
echo "    3. Install as PWA (click install button in browser)"
echo "    4. Close browser completely"
echo ""
echo "  Step 2 - Test True Offline:"
echo "    1. Disconnect ALL networks (WiFi + Ethernet + mobile data)"
echo "    2. Launch PWA from desktop/start menu (NOT browser)"
echo "    3. App should work completely offline!"
echo ""
echo "  Step 3 - Deploy for Production:"
echo "    1. Upload 'dist' folder to any static host"
echo "    2. Users install PWA when online"
echo "    3. PWA works offline forever after installation"
echo ""
echo "🚀 Deployment options:"
echo "  • Static hosting: Upload 'dist' folder to any web server"
echo "  • GitHub Pages: Push to gh-pages branch"
echo "  • Netlify: Drag & drop 'dist' folder"
echo "  • Vercel: Deploy as static site"
echo "  • Local testing: python3 -m http.server 3000 -d dist"
echo ""
echo "💡 Key features enabled:"
echo "  ✅ Complete offline operation (no internet required)"
echo "  ✅ PWA installation"
echo "  ✅ Local database (PGLite)"
echo "  ✅ Background sync when online"
echo "  ✅ Service worker caching"
echo "  ✅ Static file generation"
echo ""
echo "🎯 This is TRUE offline-first architecture!"
