#!/bin/bash

# HMS IP Fix Script
# This script fixes common deployment issues

set -e

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

echo "=========================================="
echo "    HMS IP Fix Script"
echo "=========================================="
echo ""

# Stop all services
print_status "Stopping all services..."
docker compose -f docker-compose.backend.yml -p hms-backend down
docker compose -f docker-compose.frontend.yml -p hms-frontend down
print_success "All services stopped"

# Clean up any orphaned containers
print_status "Cleaning up orphaned containers..."
docker container prune -f

# Rebuild and start backend first
print_status "Starting backend services..."
docker compose -f docker-compose.backend.yml -p hms-backend up -d --build

# Wait for backend to be ready
print_status "Waiting for backend to be ready..."
sleep 30

# Check if backend is healthy
print_status "Checking backend health..."
for i in {1..10}; do
    if curl -f http://localhost:8080/actuator/health >/dev/null 2>&1; then
        print_success "Backend is healthy"
        break
    fi
    if [ $i -eq 10 ]; then
        print_error "Backend health check failed"
        print_status "Backend logs:"
        docker logs hms-backend --tail 20
        exit 1
    fi
    print_status "Waiting for backend... (attempt $i/10)"
    sleep 5
done

# Start frontend
print_status "Starting frontend services..."
docker compose -f docker-compose.frontend.yml -p hms-frontend up -d --build

# Wait for frontend to be ready
print_status "Waiting for frontend to be ready..."
sleep 10

# Check if frontend is healthy
print_status "Checking frontend health..."
for i in {1..5}; do
    if curl -f http://localhost:8081 >/dev/null 2>&1; then
        print_success "Frontend is healthy"
        break
    fi
    if [ $i -eq 5 ]; then
        print_error "Frontend health check failed"
        print_status "Frontend logs:"
        docker logs hms-frontend --tail 20
        exit 1
    fi
    print_status "Waiting for frontend... (attempt $i/5)"
    sleep 3
done

# Test API connectivity
print_status "Testing API connectivity..."
if docker exec hms-frontend curl -f http://hms-backend:8080/actuator/health >/dev/null 2>&1; then
    print_success "Frontend can reach backend via Docker network"
else
    print_error "Frontend CANNOT reach backend via Docker network"
    print_status "This indicates a network configuration issue"
fi

print_success "Fix completed!"
echo ""
echo "Access URLs:"
echo "  Frontend: http://152.53.164.124:8081"
echo "  Backend API: http://152.53.164.124:8081/api/v1"
echo "  Health Check: http://152.53.164.124:8081/api/v1/actuator/health"
