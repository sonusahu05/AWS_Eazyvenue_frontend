#!/bin/bash

# Script to download and install all dependencies for the Angular project
# This script handles both npm and yarn package managers

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

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to detect package manager
detect_package_manager() {
    if [ -f "yarn.lock" ]; then
        echo "yarn"
    elif [ -f "package-lock.json" ]; then
        echo "npm"
    else
        # Default to npm if no lock file exists
        echo "npm"
    fi
}

# Main installation function
install_dependencies() {
    local package_manager=$1
    
    print_status "Installing dependencies using $package_manager..."
    
    case $package_manager in
        "yarn")
            if command_exists yarn; then
                yarn install --frozen-lockfile
            else
                print_error "Yarn is not installed. Please install yarn first or use npm."
                return 1
            fi
            ;;
        "npm")
            if command_exists npm; then
                npm ci --prefer-offline --no-audit
            else
                print_error "npm is not installed. Please install Node.js and npm first."
                return 1
            fi
            ;;
        *)
            print_error "Unknown package manager: $package_manager"
            return 1
            ;;
    esac
}

# Function to clean cache and node_modules
clean_install() {
    local package_manager=$1
    
    print_status "Performing clean installation..."
    
    # Remove node_modules and lock files
    if [ -d "node_modules" ]; then
        print_status "Removing existing node_modules directory..."
        rm -rf node_modules
    fi
    
    # Clean package manager cache
    case $package_manager in
        "yarn")
            if command_exists yarn; then
                print_status "Cleaning yarn cache..."
                yarn cache clean
            fi
            ;;
        "npm")
            if command_exists npm; then
                print_status "Cleaning npm cache..."
                npm cache clean --force
            fi
            ;;
    esac
}

# Function to verify installation
verify_installation() {
    print_status "Verifying installation..."
    
    if [ -d "node_modules" ] && [ -s "node_modules" ]; then
        print_success "Dependencies installed successfully!"
        
        # Count installed packages
        local package_count=$(find node_modules -maxdepth 1 -type d | wc -l)
        print_status "Total packages installed: $((package_count - 1))"
        
        return 0
    else
        print_error "Installation failed or node_modules is empty!"
        return 1
    fi
}

# Function to show Angular CLI version
show_angular_info() {
    if command_exists ng; then
        print_status "Angular CLI version:"
        ng version --skip-git 2>/dev/null || true
    else
        print_warning "Angular CLI not found globally. You may need to install it: npm install -g @angular/cli"
    fi
}

# Main script execution
main() {
    print_status "Starting dependency installation for Angular project..."
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Make sure you're in the correct directory."
        exit 1
    fi
    
    # Show project information
    print_status "Project: $(grep -o '"name": "[^"]*' package.json | cut -d'"' -f4)"
    print_status "Version: $(grep -o '"version": "[^"]*' package.json | cut -d'"' -f4)"
    
    # Detect package manager
    local package_manager=$(detect_package_manager)
    print_status "Detected package manager: $package_manager"
    
    # Check for clean install flag
    if [ "$1" = "--clean" ] || [ "$1" = "-c" ]; then
        clean_install "$package_manager"
    fi
    
    # Install dependencies
    if install_dependencies "$package_manager"; then
        verify_installation
        show_angular_info
        
        print_success "All dependencies have been successfully installed!"
        print_status "You can now run the project with: npm start or ng serve"
    else
        print_error "Dependency installation failed!"
        exit 1
    fi
}

# Show help
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --clean, -c    Clean install (removes node_modules and cache first)"
    echo "  --help, -h     Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0              # Normal installation"
    echo "  $0 --clean     # Clean installation"
}

# Handle command line arguments
case "${1:-}" in
    --help|-h)
        show_help
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac
