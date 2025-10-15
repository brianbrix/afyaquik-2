#!/bin/bash

# HMS Production Deployment Script
# This script deploys the HMS application with production settings

set -e

# Configuration
PROJECT_NAME="hms"
NETWORK_NAME="traefik_proxy"
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
    
    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if environment file exists
    if [ ! -f "$ENV_FILE" ]; then
        print_warning "Environment file '$ENV_FILE' not found. Creating from example..."
        if [ -f "hms.env.example" ]; then
            cp hms.env.example "$ENV_FILE"
            print_warning "Please edit '$ENV_FILE' with your configuration before running again."
            exit 1
        else
            print_error "Environment file '$ENV_FILE' not found and no example available."
            exit 1
        fi
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

# Function to validate environment
validate_environment() {
    print_status "Validating environment configuration..."
    
    # Source environment file
    set -a
    source "$ENV_FILE"
    set +a
    
    # Check required variables
    if [ -z "$DOMAIN" ] || [ "$DOMAIN" = "your-domain.com" ]; then
        print_error "Please set a valid DOMAIN in $ENV_FILE"
        exit 1
    fi
    
    if [ -z "$POSTGRES_PASSWORD" ] || [ "$POSTGRES_PASSWORD" = "hms_password" ]; then
        print_warning "Using default database password. Consider changing it in production."
    fi
    
    if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "your-jwt-secret-key-here" ]; then
        print_error "Please set a secure JWT_SECRET in $ENV_FILE"
        exit 1
    fi
    
    if [ -z "$ENCRYPTION_KEY" ] || [ "$ENCRYPTION_KEY" = "your-encryption-key-here" ]; then
        print_error "Please set a secure ENCRYPTION_KEY in $ENV_FILE"
        exit 1
    fi
    
    print_success "Environment validation passed"
}

# Function to deploy services
deploy_services() {
    print_status "Deploying HMS services..."
    
    # Build and start all services
    docker compose -f docker-compose.prod.yml --env-file "$ENV_FILE" -p "$PROJECT_NAME" up -d --build
    
    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    sleep 15
    
    # Check if backend is healthy
    print_status "Checking backend health..."
    for i in {1..60}; do
        if curl -f http://localhost:8080/actuator/health >/dev/null 2>&1; then
            print_success "Backend is healthy"
            break
        fi
        if [ $i -eq 60 ]; then
            print_error "Backend health check failed after 2 minutes"
            print_status "Checking backend logs..."
            docker compose -f docker-compose.prod.yml -p "$PROJECT_NAME" logs hms-backend
            exit 1
        fi
        sleep 2
    done
    
    # Check if frontend is healthy
    print_status "Checking frontend health..."
    for i in {1..30}; do
        if curl -f http://localhost/health >/dev/null 2>&1; then
            print_success "Frontend is healthy"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "Frontend health check failed"
            print_status "Checking frontend logs..."
            docker compose -f docker-compose.prod.yml -p "$PROJECT_NAME" logs hms-frontend
            exit 1
        fi
        sleep 2
    done
}

# Function to show deployment status
show_status() {
    print_status "Deployment Status:"
    echo ""
    docker compose -f docker-compose.prod.yml -p "$PROJECT_NAME" ps
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
    echo "  Database: $POSTGRES_DB"
    echo "  Username: $POSTGRES_USER"
    echo "  Password: $POSTGRES_PASSWORD"
    echo ""
    echo "MinIO (for file storage):"
    echo "  URL: http://localhost:9000"
    echo "  Username: $MINIO_ROOT_USER"
    echo "  Password: $MINIO_ROOT_PASSWORD"
    echo ""
    echo "Management Commands:"
    echo "  View logs: ./logs-prod.sh"
    echo "  Stop services: ./stop-prod.sh"
    echo "  Restart services: ./restart-prod.sh"
}

# Function to cleanup
cleanup() {
    print_status "Cleaning up temporary files..."
    # No temporary files to clean up in this version
}

# Main deployment function
main() {
    echo "=========================================="
    echo "    HMS Production Deployment Script"
    echo "=========================================="
    echo ""
    
    # Run deployment steps
    check_prerequisites
    validate_environment
    deploy_services
    show_status
    cleanup
    
    print_success "Production deployment completed successfully!"
}

# Handle script interruption
trap cleanup EXIT

# Run main function
main "$@"
