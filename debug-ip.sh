#!/bin/bash

# HMS IP Debug Script
# This script helps diagnose deployment issues

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
echo "    HMS IP Debug Script"
echo "=========================================="
echo ""

# Check Docker containers
print_status "Checking Docker containers..."
echo ""
echo "All containers:"
docker ps -a
echo ""

print_status "Backend services:"
docker compose -f docker-compose.backend.yml -p hms-backend ps
echo ""

print_status "Frontend services:"
docker compose -f docker-compose.frontend.yml -p hms-frontend ps
echo ""

# Check networks
print_status "Checking Docker networks..."
docker network ls
echo ""

# Check if backend is healthy
print_status "Checking backend health..."
if curl -f http://localhost:8080/actuator/health >/dev/null 2>&1; then
    print_success "Backend is responding on localhost:8080"
else
    print_error "Backend is NOT responding on localhost:8080"
fi

# Check if frontend is healthy
print_status "Checking frontend health..."
if curl -f http://localhost:8081 >/dev/null 2>&1; then
    print_success "Frontend is responding on localhost:8081"
else
    print_error "Frontend is NOT responding on localhost:8081"
fi

# Check backend logs
print_status "Backend logs (last 20 lines):"
docker logs hms-backend --tail 20
echo ""

# Check frontend logs
print_status "Frontend logs (last 20 lines):"
docker logs hms-frontend --tail 20
echo ""

# Test network connectivity from frontend to backend
print_status "Testing network connectivity from frontend to backend..."
if docker exec hms-frontend curl -f http://hms-backend:8080/actuator/health >/dev/null 2>&1; then
    print_success "Frontend can reach backend via Docker network"
else
    print_error "Frontend CANNOT reach backend via Docker network"
    print_status "This is likely the cause of the 502 error"
fi

# Check if services are on the same network
print_status "Checking network configuration..."
BACKEND_NETWORKS=$(docker inspect hms-backend --format='{{range $key, $value := .NetworkSettings.Networks}}{{$key}} {{end}}')
FRONTEND_NETWORKS=$(docker inspect hms-frontend --format='{{range $key, $value := .NetworkSettings.Networks}}{{$key}} {{end}}')

echo "Backend networks: $BACKEND_NETWORKS"
echo "Frontend networks: $FRONTEND_NETWORKS"

# Check for common network
if echo "$BACKEND_NETWORKS" | grep -q "hms-network" && echo "$FRONTEND_NETWORKS" | grep -q "hms-network"; then
    print_success "Both services are on hms-network"
else
    print_error "Services are not on the same network"
fi

echo ""
print_status "Debug completed!"
