#!/bin/bash

# Weather Forecast Application Startup Script

echo "🌤️  Starting Israel Weather Forecast Application..."
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found."
    exit 1
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo ""
echo "🔨 Building TypeScript..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo ""
echo "🚀 Starting server..."
echo "📍 Open your browser at: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
node dist/server.js
