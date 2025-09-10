#!/bin/bash

# Setup Automated Data Fetcher
# This script sets up the automated data fetching system

echo "🚀 Setting up Automated Data Fetcher..."

# Check if node-cron is installed
if ! npm list node-cron > /dev/null 2>&1; then
    echo "📦 Installing node-cron..."
    npm install node-cron
fi

# Make the script executable
chmod +x scripts/automated-data-fetcher.js

# Create logs directory
mkdir -p logs

echo "✅ Setup complete!"
echo ""
echo "📋 Usage Options:"
echo ""
echo "1. Run immediately (test):"
echo "   node scripts/automated-data-fetcher.js --now"
echo ""
echo "2. Set up monthly cron job:"
echo "   node scripts/automated-data-fetcher.js --cron"
echo ""
echo "3. Manual monthly run:"
echo "   node scripts/automated-data-fetcher.js --now"
echo ""
echo "📁 Logs will be saved to: logs/data-fetcher-YYYY-MM-DD.log"
echo ""
echo "🔄 The system will automatically:"
echo "   - Check if data is older than 30 days"
echo "   - Try multiple data sources"
echo "   - Download and process new data"
echo "   - Update your Supabase database"
echo ""
echo "🎯 This will solve the headteacher data discrepancy issue!"

