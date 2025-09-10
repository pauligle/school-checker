#!/bin/bash

# School Checker Deployment Script
# This script sets up the complete School Checker system

set -e  # Exit on any error

echo "🚀 Starting School Checker deployment..."

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

if [ $? -eq 0 ]; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Step 2: Create necessary directories
print_status "Creating data and log directories..."
mkdir -p data/raw data/processed logs

if [ $? -eq 0 ]; then
    print_success "Directories created successfully"
else
    print_error "Failed to create directories"
    exit 1
fi

# Step 3: Check environment variables
print_status "Checking environment variables..."

if [ ! -f ".env.local" ]; then
    print_warning ".env.local file not found. Please create it with the following variables:"
    echo "NEXT_PUBLIC_SUPABASE_URL=your_supabase_url"
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key"
    echo "SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key"
    echo ""
    echo "You can get these from your Supabase project dashboard."
    echo ""
    read -p "Press Enter to continue after creating .env.local..."
fi

# Check if required env vars are set
if [ -f ".env.local" ]; then
    source .env.local
    
    if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
        print_error "Missing required environment variables in .env.local"
        print_error "Please ensure NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY are set"
        exit 1
    else
        print_success "Environment variables are properly configured"
    fi
else
    print_error ".env.local file not found"
    exit 1
fi

# Step 4: Database setup instructions
print_status "Database setup required..."
echo ""
echo "📋 Please run the following SQL in your Supabase SQL Editor:"
echo ""
echo "1. Go to your Supabase project dashboard"
echo "2. Navigate to SQL Editor"
echo "3. Copy and paste the contents of scripts/database-schema.sql"
echo "4. Click 'Run' to execute the schema"
echo ""
read -p "Press Enter after you've set up the database schema..."

# Step 5: Build the application
print_status "Building the application..."
npm run build

if [ $? -eq 0 ]; then
    print_success "Application built successfully"
else
    print_error "Failed to build application"
    exit 1
fi

# Step 6: Test the data pipeline
print_status "Testing the data pipeline..."

# Test data fetcher
print_status "Testing data fetcher..."
node scripts/data-fetcher.js sources

# Test data processor
print_status "Testing data processor..."
node scripts/data-processor.js

# Test data importer
print_status "Testing data importer..."
node scripts/data-importer.js status

print_success "Data pipeline tests completed"

# Step 7: Set up cron scheduler
print_status "Setting up automated data pipeline..."

echo ""
echo "🕐 The automated data pipeline will run on the following schedule:"
echo "   • Full pipeline: Every Sunday at 1 AM"
echo "   • Ofsted updates: Every Monday at 2 AM"
echo "   • Schools updates: 1st of each month at 3 AM"
echo "   • Performance updates: September 1st at 4 AM"
echo "   • Health checks: Daily at 6 AM"
echo ""

read -p "Do you want to start the automated scheduler now? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Starting automated scheduler..."
    echo "The scheduler will run in the background. Use 'npm run cron:setup stop' to stop it."
    echo ""
    echo "To start it manually later, run:"
    echo "  npm run cron:setup start"
    echo ""
    echo "To run a manual update:"
    echo "  npm run cron:setup run all"
    echo "  npm run cron:setup run schools"
    echo "  npm run cron:setup run ofsted"
    echo "  npm run cron:setup run performance"
    echo ""
    
    # Start the scheduler in the background
    nohup node scripts/setup-cron.js start > logs/cron-scheduler.log 2>&1 &
    CRON_PID=$!
    echo $CRON_PID > .cron-pid
    print_success "Automated scheduler started (PID: $CRON_PID)"
else
    print_status "Skipping automated scheduler setup"
    echo "You can start it later with: npm run cron:setup start"
fi

# Step 8: Test the cron setup
print_status "Testing cron setup..."
npm run cron:test all

if [ $? -eq 0 ]; then
    print_success "Cron setup test completed"
else
    print_warning "Cron setup test had issues - check logs/cron-scheduler.log"
fi

# Step 9: Optional Vercel deployment
echo ""
read -p "Do you want to deploy to Vercel? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Deploying to Vercel..."
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        print_status "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    # Deploy to Vercel
    npx vercel --prod
    
    if [ $? -eq 0 ]; then
        print_success "Deployed to Vercel successfully"
    else
        print_error "Failed to deploy to Vercel"
    fi
else
    print_status "Skipping Vercel deployment"
    echo "You can deploy later with: npx vercel --prod"
fi

# Step 10: Final instructions
echo ""
print_success "🎉 School Checker deployment completed!"
echo ""
echo "📋 Next steps:"
echo "1. Start the development server: npm run dev"
echo "2. Visit http://localhost:3000 to test the application"
echo "3. Check the logs in the logs/ directory"
echo "4. Monitor the automated pipeline with: npm run cron:setup status"
echo ""
echo "📁 Important directories:"
echo "   • data/raw/ - Raw downloaded data"
echo "   • data/processed/ - Cleaned and processed data"
echo "   • logs/ - Application and pipeline logs"
echo ""
echo "🔧 Useful commands:"
echo "   • npm run dev - Start development server"
echo "   • npm run cron:setup start - Start automated scheduler"
echo "   • npm run cron:setup stop - Stop automated scheduler"
echo "   • npm run cron:setup run all - Run manual data update"
echo "   • npm run data:fetch fetch-all - Download all data"
echo "   • npm run data:process process-all - Process all data"
echo "   • npm run data:import import-all - Import all data"
echo ""
echo "📊 Monitor your data pipeline:"
echo "   • Check logs/cron-scheduler-*.log for scheduler logs"
echo "   • Check logs/data-fetcher-*.log for download logs"
echo "   • Check logs/data-processor-*.log for processing logs"
echo "   • Check logs/data-importer-*.log for import logs"
echo ""

print_success "Deployment script completed successfully!"
