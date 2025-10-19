#!/bin/bash

# HMS Deployment Script
# This script deploys the HMS application with Traefik integration

set -e

# Configuration
DOMAIN="152.53.164.124"
PROJECT_NAME="hms"
NETWORK_NAME="traefik_proxy"

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command_exists docker composer; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if Traefik network exists
    if ! docker network ls | grep -q "$NETWORK_NAME"; then
        print_warning "Traefik network '$NETWORK_NAME' does not exist. Creating it..."
        docker network create "$NETWORK_NAME" || {
            print_error "Failed to create Traefik network. Please ensure Traefik is running."
            exit 1
        }
    fi
    
    print_success "Prerequisites check passed"
}

# Function to update domain in configuration files
update_domain() {
    print_status "Updating domain configuration..."
    
    # Update backend compose file
    sed -i.bak "s/your-domain.com/$DOMAIN/g" docker-compose.backend.yml
    
    # Update frontend compose file
    sed -i.bak "s/your-domain.com/$DOMAIN/g" docker-compose.frontend.yml
    
    # Update frontend environment
    sed -i.bak "s/your-domain.com/$DOMAIN/g" hms-frontend/Dockerfile.frontend
    
    print_success "Domain configuration updated"
}

# Function to build and start backend
deploy_backend() {
    print_status "Deploying HMS Backend..."
    
    # Build and start backend services
    docker compose -f docker-compose.backend.yml -p "$PROJECT_NAME-backend" up -d --build
    
    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    sleep 10
    
}

# Function to build and start frontend
deploy_frontend() {
    print_status "Deploying HMS Frontend..."
    
    # Build and start frontend
    docker compose -f docker-compose.frontend.yml -p "$PROJECT_NAME-frontend" up -d --build
    
    # Wait for frontend to be ready
    print_status "Waiting for frontend to be ready..."
    sleep 5
    
}

# Function to show deployment status
show_status() {
    print_status "Deployment Status:"
    echo ""
    echo "Backend Services:"
    docker compose -f docker-compose.backend.yml -p "$PROJECT_NAME-backend" ps
    echo ""
    echo "Frontend Services:"
    docker compose -f docker-compose.frontend.yml -p "$PROJECT_NAME-frontend" ps
    echo ""
    print_success "HMS Application deployed successfully!"
    echo ""
    echo "Access URLs:"
    echo "  Frontend: https://$DOMAIN/hms"
    echo "  Backend API: https://$DOMAIN/hms/api"
    echo "  Health Check: https://$DOMAIN/hms/api/actuator/health"
    echo ""
    echo "Database (for debugging):"
    echo "  Host: localhost"
    echo "  Port: 5433"
    echo "  Database: hms_db"
    echo "  Username: hms_user"
    echo "  Password: hms_password"
    echo ""
    echo "MinIO (for file storage):"
    echo "  URL: http://localhost:9000"
    echo "  Username: minioadmin"
    echo "  Password: minioadmin123"
}

# Function to cleanup
cleanup() {
    print_status "Cleaning up temporary files..."
    rm -f docker-compose.backend.yml.bak docker-compose.frontend.yml.bak hms-frontend/Dockerfile.frontend.bak
}

# Main deployment function
main() {
    echo "=========================================="
    echo "    HMS Deployment Script"
    echo "=========================================="
    echo ""
    
    # Check if domain is provided
    if [ -n "$1" ]; then
        DOMAIN="$1"
        print_status "Using domain: $DOMAIN"
    else
        print_warning "No domain provided. Using default: $DOMAIN"
        print_warning "You can specify a domain as the first argument: ./deploy.sh your-domain.com"
    fi
    
    # Run deployment steps
    check_prerequisites
    update_domain
    deploy_backend
    deploy_frontend
    show_status
    cleanup
    
    print_success "Deployment completed successfully!"
}

# Handle script interruption
trap cleanup EXIT

# Run main function
main "$@"
