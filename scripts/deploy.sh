#!/bin/bash

# School Checker - Complete Deployment Script
# This script sets up the entire automated data pipeline

set -e  # Exit on any error

echo "🚀 School Checker - Complete Deployment"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Step 1: Install dependencies
print_status "Installing dependencies..."
npm install
print_success "Dependencies installed"

# Step 2: Create necessary directories
print_status "Creating directories..."
mkdir -p data/raw
mkdir -p data/processed
mkdir -p logs
print_success "Directories created"

# Step 3: Check environment variables
print_status "Checking environment variables..."
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    print_error "NEXT_PUBLIC_SUPABASE_URL not set"
    exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    print_error "NEXT_PUBLIC_SUPABASE_ANON_KEY not set"
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    print_error "SUPABASE_SERVICE_ROLE_KEY not set"
    exit 1
fi

print_success "Environment variables configured"

# Step 4: Set up database schema
print_status "Setting up database schema..."
if command -v psql &> /dev/null; then
    # If psql is available, we can run the schema directly
    print_warning "psql found - you can run the schema manually:"
    echo "psql -h your-host -U your-user -d your-database -f scripts/database-schema.sql"
else
    print_warning "psql not found - please run the database schema manually:"
    echo "Copy the contents of scripts/database-schema.sql to your Supabase SQL editor"
fi

# Step 5: Test the data pipeline
print_status "Testing data pipeline..."
if npm run data:fetch status &> /dev/null; then
    print_success "Data fetcher working"
else
    print_warning "Data fetcher test failed - this is normal if no data files exist yet"
fi

# Step 6: Build the application
print_status "Building the application..."
npm run build
print_success "Application built successfully"

# Step 7: Set up cron jobs (optional)
print_status "Setting up automated scheduling..."
echo ""
echo "To set up automated data updates, run:"
echo "  npm run cron:setup start"
echo ""
echo "This will schedule:"
echo "  - Weekly Ofsted updates (Mondays 2 AM)"
echo "  - Monthly schools updates (1st of month 3 AM)"
echo "  - Annual performance updates (September 1st 4 AM)"
echo "  - Daily health checks (6 AM)"

# Step 8: Test the system
print_status "Running system tests..."
if npm run cron:test all &> /dev/null; then
    print_success "System tests passed"
else
    print_warning "Some system tests failed - check the logs for details"
fi

# Step 9: Deploy to Vercel (if requested)
if [ "$1" = "--deploy" ]; then
    print_status "Deploying to Vercel..."
    npx vercel --prod
    print_success "Deployed to Vercel"
fi

# Step 10: Final instructions
echo ""
echo "🎉 Deployment Complete!"
echo "======================"
echo ""
echo "Next steps:"
echo "1. Run the database schema in your Supabase SQL editor:"
echo "   scripts/database-schema.sql"
echo ""
echo "2. Test the data pipeline manually:"
echo "   npm run data:pipeline"
echo ""
echo "3. Start automated updates:"
echo "   npm run cron:setup start"
echo ""
echo "4. Monitor the system:"
echo "   npm run cron:setup status"
echo ""
echo "5. View logs:"
echo "   tail -f logs/cron.log"
echo ""
echo "Useful commands:"
echo "  npm run data:fetch all      # Download all data"
echo "  npm run data:process all    # Process data"
echo "  npm run data:import all     # Import to database"
echo "  npm run cron:test all       # Test the system"
echo "  npm run dev                 # Start development server"
echo ""

print_success "School Checker is ready to use!"
