#!/bin/bash

# HMS IP Stop Script
# This script stops the HMS application

set -e

# Configuration
PROJECT_NAME="hms"

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

# Function to stop services
stop_services() {
    print_status "Stopping HMS services..."
    
    # Stop frontend
    print_status "Stopping frontend services..."
    docker compose -f docker-compose.frontend.yml -p "$PROJECT_NAME-frontend" down
    
    # Stop backend
    print_status "Stopping backend services..."
    docker compose -f docker-compose.backend.yml -p "$PROJECT_NAME-backend" down
    
    print_success "All HMS services stopped"
}

# Function to show status
show_status() {
    print_status "Checking remaining containers..."
    echo ""
    echo "Remaining HMS containers:"
    docker ps --filter "name=hms-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""
}

# Main function
main() {
    echo "=========================================="
    echo "    HMS IP Stop Script"
    echo "=========================================="
    echo ""
    
    stop_services
    show_status
    
    print_success "HMS application stopped successfully!"
}

# Run main function
main "$@"
