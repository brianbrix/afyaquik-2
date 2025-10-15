#!/bin/bash

# HMS Production Restart Script
# This script restarts the HMS application

set -e

# Configuration
PROJECT_NAME="hms"
ENV_FILE="hms.env"

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

# Function to restart services
restart_services() {
    print_status "Restarting HMS services..."
    
    # Restart all services
    docker compose -f docker-compose.prod.yml --env-file "$ENV_FILE" -p "$PROJECT_NAME" restart
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 10
    
    # Check backend health
    print_status "Checking backend health..."
    for i in {1..30}; do
        if curl -f http://localhost:8080/actuator/health >/dev/null 2>&1; then
            print_success "Backend is healthy"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "Backend health check failed"
            exit 1
        fi
        sleep 2
    done
    
    # Check frontend health
    print_status "Checking frontend health..."
    for i in {1..15}; do
        if curl -f http://localhost/health >/dev/null 2>&1; then
            print_success "Frontend is healthy"
            break
        fi
        if [ $i -eq 15 ]; then
            print_error "Frontend health check failed"
            exit 1
        fi
        sleep 2
    done
    
    print_success "All HMS services restarted"
}

# Function to show status
show_status() {
    print_status "Checking service status..."
    echo ""
    docker compose -f docker-compose.prod.yml --env-file "$ENV_FILE" -p "$PROJECT_NAME" ps
    echo ""
}

# Main function
main() {
    echo "=========================================="
    echo "    HMS Production Restart Script"
    echo "=========================================="
    echo ""
    
    restart_services
    show_status
    
    print_success "HMS application restarted successfully!"
}

# Run main function
main "$@"
