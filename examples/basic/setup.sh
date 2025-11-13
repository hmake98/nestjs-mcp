#!/bin/bash

# Setup script for the basic example
echo "🔧 Setting up nestjs-mcp basic example..."
echo ""

# Check if we're in the right directory
if [ ! -f "../../package.json" ]; then
    echo "❌ Error: This script must be run from examples/basic directory"
    exit 1
fi

# Build the parent library if needed
if [ ! -d "../../dist" ]; then
    echo "📦 Building nestjs-mcp library..."
    cd ../..
    npm install
    npm run build
    cd examples/basic
    echo "✅ Library built successfully"
    echo ""
fi

# Install example dependencies
echo "📦 Installing example dependencies..."
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start the server, run:"
echo "   npm start"
echo ""
echo "📚 For more information, see README.md"
