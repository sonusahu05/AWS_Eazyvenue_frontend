#!/bin/bash

echo "Starting EazyVenue SSR Server..."
echo "Building the application first..."

# Build the application
NODE_OPTIONS="--openssl-legacy-provider --max-old-space-size=8192" npm run build:ssr

if [ $? -eq 0 ]; then
    echo "Build successful! Starting SSR server..."
    echo "Server will be available at: http://localhost:4000"
    echo "Press Ctrl+C to stop the server"
    echo "----------------------------------------"
    
    # Start the SSR server
    node dist/freya-ng/server/main.js
else
    echo "Build failed! Please check the errors above."
    exit 1
fi
