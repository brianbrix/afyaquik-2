#!/bin/bash

# HMS Production Logs Script
# This script shows logs for HMS services

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

# Function to show logs
show_logs() {
    local service="$1"
    local follow="$2"
    
    case "$service" in
        "backend"|"b")
            print_status "Showing backend logs..."
            if [ "$follow" = "true" ]; then
                docker-compose -f docker-compose.prod.yml --env-file "$ENV_FILE" -p "$PROJECT_NAME" logs -f hms-backend
            else
                docker-compose -f docker-compose.prod.yml --env-file "$ENV_FILE" -p "$PROJECT_NAME" logs --tail=100 hms-backend
            fi
            ;;
        "frontend"|"f")
            print_status "Showing frontend logs..."
            if [ "$follow" = "true" ]; then
                docker-compose -f docker-compose.prod.yml --env-file "$ENV_FILE" -p "$PROJECT_NAME" logs -f hms-frontend
            else
                docker-compose -f docker-compose.prod.yml --env-file "$ENV_FILE" -p "$PROJECT_NAME" logs --tail=100 hms-frontend
            fi
            ;;
        "database"|"db")
            print_status "Showing database logs..."
            if [ "$follow" = "true" ]; then
                docker-compose -f docker-compose.prod.yml --env-file "$ENV_FILE" -p "$PROJECT_NAME" logs -f hms-db
            else
                docker-compose -f docker-compose.prod.yml --env-file "$ENV_FILE" -p "$PROJECT_NAME" logs --tail=100 hms-db
            fi
            ;;
        "redis"|"r")
            print_status "Showing Redis logs..."
            if [ "$follow" = "true" ]; then
                docker-compose -f docker-compose.prod.yml --env-file "$ENV_FILE" -p "$PROJECT_NAME" logs -f hms-redis
            else
                docker-compose -f docker-compose.prod.yml --env-file "$ENV_FILE" -p "$PROJECT_NAME" logs --tail=100 hms-redis
            fi
            ;;
        "minio"|"m")
            print_status "Showing MinIO logs..."
            if [ "$follow" = "true" ]; then
                docker-compose -f docker-compose.prod.yml --env-file "$ENV_FILE" -p "$PROJECT_NAME" logs -f hms-minio
            else
                docker-compose -f docker-compose.prod.yml --env-file "$ENV_FILE" -p "$PROJECT_NAME" logs --tail=100 hms-minio
            fi
            ;;
        "all"|"")
            print_status "Showing all logs..."
            if [ "$follow" = "true" ]; then
                docker-compose -f docker-compose.prod.yml --env-file "$ENV_FILE" -p "$PROJECT_NAME" logs -f
            else
                docker-compose -f docker-compose.prod.yml --env-file "$ENV_FILE" -p "$PROJECT_NAME" logs --tail=50
            fi
            ;;
        *)
            print_error "Unknown service: $service"
            echo "Usage: $0 [backend|frontend|database|redis|minio|all] [follow]"
            echo "  backend, b     - Show backend logs"
            echo "  frontend, f    - Show frontend logs"
            echo "  database, db   - Show database logs"
            echo "  redis, r       - Show Redis logs"
            echo "  minio, m       - Show MinIO logs"
            echo "  all            - Show all logs (default)"
            echo "  follow         - Follow logs in real-time"
            exit 1
            ;;
    esac
}

# Main function
main() {
    echo "=========================================="
    echo "    HMS Production Logs Script"
    echo "=========================================="
    echo ""
    
    local service="${1:-all}"
    local follow="${2:-false}"
    
    if [ "$follow" = "follow" ] || [ "$follow" = "f" ]; then
        follow="true"
    fi
    
    show_logs "$service" "$follow"
}

# Run main function
main "$@"
