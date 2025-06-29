#!/bin/bash

# EasyVenue Angular Startup Script
# This script automatically handles Node.js compatibility issues and starts the development server

set -e  # Exit on any error

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

# Get Node.js version
get_node_version() {
    node --version | sed 's/v//' | cut -d. -f1
}

# Check if we're in the right directory
check_directory() {
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Make sure you're in the Angular project directory."
        exit 1
    fi
    
    if [ ! -f "angular.json" ]; then
        print_error "angular.json not found. This doesn't appear to be an Angular project."
        exit 1
    fi
}

# Check Node.js compatibility
check_node_compatibility() {
    local node_version=$(get_node_version)
    print_status "Detected Node.js version: v$node_version"
    
    if [ "$node_version" -ge 17 ]; then
        print_warning "Node.js v$node_version detected. Using legacy OpenSSL provider for Angular 12 compatibility."
        export NODE_OPTIONS="--openssl-legacy-provider"
    else
        print_status "Node.js v$node_version is compatible with Angular 12."
    fi
}

# Check if dependencies are installed
check_dependencies() {
    if [ ! -d "node_modules" ]; then
        print_warning "node_modules not found. Installing dependencies first..."
        npm install
    fi
}

# Start the development server
start_server() {
    print_status "Starting Angular development server..."
    print_status "Your app will be available at: http://localhost:4200"
    print_status "Press Ctrl+C to stop the server"
    echo ""
    
    # Start the server (this will run in foreground)
    npm start
}

# Show help
show_help() {
    echo "EasyVenue Angular Startup Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --help, -h     Show this help message"
    echo "  --install, -i  Install dependencies before starting"
    echo "  --port PORT    Specify port (default: 4200)"
    echo ""
    echo "Examples:"
    echo "  $0              # Start the development server"
    echo "  $0 --install    # Install dependencies and start"
    echo "  $0 --port 3000  # Start on port 3000"
}

# Parse command line arguments
INSTALL_DEPS=false
CUSTOM_PORT=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --help|-h)
            show_help
            exit 0
            ;;
        --install|-i)
            INSTALL_DEPS=true
            shift
            ;;
        --port)
            CUSTOM_PORT="$2"
            shift 2
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Main execution
main() {
    print_status "🚀 Starting EasyVenue Angular Application..."
    
    # Check if we're in the right directory
    check_directory
    
    # Check Node.js compatibility and set environment variables
    check_node_compatibility
    
    # Install dependencies if requested or needed
    if [ "$INSTALL_DEPS" = true ]; then
        print_status "Installing dependencies..."
        npm install
    else
        check_dependencies
    fi
    
    # Set custom port if specified
    if [ -n "$CUSTOM_PORT" ]; then
        export PORT="$CUSTOM_PORT"
        print_status "Using custom port: $CUSTOM_PORT"
    fi
    
    # Start the server
    start_server
}

# Run the main function
main "$@"
