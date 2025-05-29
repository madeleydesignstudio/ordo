#!/bin/bash

# Dashboard Deployment Script
# This script builds and deploys the dashboard to Netlify

set -e  # Exit on any error

echo "🚀 Starting Dashboard Deployment..."

# Check if we're in the right directory
if [ ! -f "netlify.toml" ]; then
    echo "❌ Error: netlify.toml not found. Please run this script from apps/dashboard directory."
    exit 1
fi

# Go to project root for build
cd ../..

echo "📦 Building dashboard..."
turbo build --filter=@ordo/dashboard

echo "✅ Build completed successfully!"

# Go back to dashboard directory
cd apps/dashboard

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "❌ Error: dist directory not found. Build may have failed."
    exit 1
fi

echo "📁 Build output:"
ls -la dist/

echo "🌐 Deploying to Netlify..."

# Check if netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI not found. Installing..."
    npm install -g netlify-cli
fi

# Deploy to production
netlify deploy --prod --dir=dist

echo "✅ Deployment completed successfully!"
echo "🎉 Your dashboard is now live!"

# Optional: Open the site
read -p "Would you like to open the deployed site? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    netlify open:site
fi 