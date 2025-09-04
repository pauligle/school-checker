#!/bin/bash

echo "🧹 Clearing all caches..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .turbo
rm -rf .swc

echo "🔄 Restarting development server..."
npm run dev

