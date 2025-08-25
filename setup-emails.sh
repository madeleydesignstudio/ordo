#!/bin/bash

# Email Setup Script for Ordo
# This script helps set up environment variables for email functionality

set -e

echo "🚀 Setting up email functionality for Ordo..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "packages/emails" ]; then
    print_error "Please run this script from the root of the Ordo project"
    exit 1
fi

print_info "Detected Ordo project structure"

# Create .env.local files if they don't exist
WEB_ENV="apps/web/.env.local"
EMAILS_ENV="packages/emails/.env.local"

# Function to create or update env file
setup_env_file() {
    local env_file=$1
    local env_dir=$(dirname "$env_file")

    # Create directory if it doesn't exist
    mkdir -p "$env_dir"

    # Check if file exists
    if [ -f "$env_file" ]; then
        print_warning "$env_file already exists"

        # Check if RESEND_API_KEY already exists
        if grep -q "RESEND_API_KEY" "$env_file"; then
            print_info "RESEND_API_KEY already configured in $env_file"
            return 0
        else
            print_info "Adding RESEND_API_KEY to existing $env_file"
        fi
    else
        print_info "Creating new $env_file"
        touch "$env_file"
    fi

    # Add RESEND_API_KEY if not present
    if ! grep -q "RESEND_API_KEY" "$env_file"; then
        echo "" >> "$env_file"
        echo "# Resend Email Configuration (Server-side only)" >> "$env_file"
        echo "RESEND_API_KEY=your_resend_api_key_here" >> "$env_file"
        print_status "Added RESEND_API_KEY to $env_file"
    fi
}

echo ""
echo "📧 Setting up environment files..."

# Setup web app env
setup_env_file "$WEB_ENV"

# Setup emails package env
setup_env_file "$EMAILS_ENV"

echo ""
echo "📦 Installing dependencies..."

# Install dependencies if needed
if command -v pnpm &> /dev/null; then
    print_info "Using pnpm to install dependencies"
    pnpm install
elif command -v npm &> /dev/null; then
    print_info "Using npm to install dependencies"
    npm install
elif command -v yarn &> /dev/null; then
    print_info "Using yarn to install dependencies"
    yarn install
else
    print_error "No package manager found. Please install pnpm, npm, or yarn"
    exit 1
fi

echo ""
echo "🔧 Configuration complete!"
echo ""
echo "📋 Next steps:"
echo ""
print_info "1. Get your Resend API key:"
echo "   - Go to https://resend.com"
echo "   - Sign up or log in"
echo "   - Navigate to 'API Keys'"
echo "   - Create a new API key"
echo ""
print_info "2. Add your API key to the environment files:"
echo "   - Edit $WEB_ENV"
echo "   - Edit $EMAILS_ENV"
echo "   - Replace 'your_resend_api_key_here' with your actual API key"
echo ""
print_info "3. Verify your domain in Resend:"
echo "   - Add and verify 'madeleydesignstudio.com' in your Resend dashboard"
echo "   - Follow the DNS verification steps"
echo ""
print_info "4. Test the email functionality:"
echo "   - Start the development server: pnpm dev (or npm run dev)"
echo "   - Go to http://localhost:3001/signup"
echo "   - Create a test account"
echo "   - Check your email for the welcome message"
echo ""
print_status "Email setup complete! Check EMAIL_SETUP.md for detailed instructions."
echo ""
