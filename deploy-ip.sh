#!/bin/bash

# HMS IP Deployment Script
# This script deploys the HMS application using IP address instead of domain

set -e

# Configuration
SERVER_IP="152.53.164.124"
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

# Function to deploy backend
deploy_backend() {
    print_status "Deploying HMS Backend..."
    
    # Build and start backend services
    docker compose -f docker-compose.backend.yml -p "$PROJECT_NAME-backend" up -d --build
    
    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    sleep 15
    
    # Check if backend is healthy
    # print_status "Checking backend health..."
    # for i in {1..30}; do
    #     if curl -f http://localhost:8080/actuator/health >/dev/null 2>&1; then
    #         print_success "Backend is healthy"
    #         break
    #     fi
    #     if [ $i -eq 30 ]; then
    #         print_error "Backend health check failed"
    #         exit 1
    #     fi
    #     sleep 2
    # done
}

# Function to deploy frontend
deploy_frontend() {
    print_status "Deploying HMS Frontend..."
    
    # Build and start frontend
    docker compose -f docker-compose.frontend.yml -p "$PROJECT_NAME-frontend" up -d --build
    
    # Wait for frontend to be ready
    print_status "Waiting for frontend to be ready..."
    sleep 5
    
    # # Check if frontend is healthy
    # print_status "Checking frontend health..."
    # for i in {1..15}; do
    #     if curl -f http://localhost/health >/dev/null 2>&1; then
    #         print_success "Frontend is healthy"
    #         break
    #     fi
    #     if [ $i -eq 15 ]; then
    #         print_error "Frontend health check failed"
    #         exit 1
    #     fi
    #     sleep 2
    # done
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
    echo "  Frontend: http://$SERVER_IP:8080/hms"
    echo "  Backend API: http://$SERVER_IP:8080/hms/api"
    echo "  Health Check: http://$SERVER_IP:8080/hms/api/actuator/health"
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
    echo ""
    echo "Management Commands:"
    echo "  View logs: ./logs-ip.sh"
    echo "  Stop services: ./stop-ip.sh"
    echo "  Restart services: ./restart-ip.sh"
}

# Main deployment function
main() {
    echo "=========================================="
    echo "    HMS IP Deployment Script"
    echo "=========================================="
    echo ""
    
    # Run deployment steps
    check_prerequisites
    deploy_backend
    deploy_frontend
    show_status
    
    print_success "Deployment completed successfully!"
}

# Run main function
main "$@"
