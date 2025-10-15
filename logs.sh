#!/bin/bash

# HMS Logs Script
# This script shows logs for HMS services

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

# Function to show logs
show_logs() {
    local service="$1"
    local follow="$2"
    
    case "$service" in
        "backend"|"b")
            print_status "Showing backend logs..."
            if [ "$follow" = "true" ]; then
                docker-compose -f docker-compose.backend.yml -p "$PROJECT_NAME-backend" logs -f
            else
                docker-compose -f docker-compose.backend.yml -p "$PROJECT_NAME-backend" logs --tail=100
            fi
            ;;
        "frontend"|"f")
            print_status "Showing frontend logs..."
            if [ "$follow" = "true" ]; then
                docker-compose -f docker-compose.frontend.yml -p "$PROJECT_NAME-frontend" logs -f
            else
                docker-compose -f docker-compose.frontend.yml -p "$PROJECT_NAME-frontend" logs --tail=100
            fi
            ;;
        "all"|"")
            print_status "Showing all logs..."
            if [ "$follow" = "true" ]; then
                docker-compose -f docker-compose.backend.yml -p "$PROJECT_NAME-backend" logs -f &
                docker-compose -f docker-compose.frontend.yml -p "$PROJECT_NAME-frontend" logs -f &
                wait
            else
                echo "=== Backend Logs ==="
                docker-compose -f docker-compose.backend.yml -p "$PROJECT_NAME-backend" logs --tail=50
                echo ""
                echo "=== Frontend Logs ==="
                docker-compose -f docker-compose.frontend.yml -p "$PROJECT_NAME-frontend" logs --tail=50
            fi
            ;;
        *)
            print_error "Unknown service: $service"
            echo "Usage: $0 [backend|frontend|all] [follow]"
            echo "  backend, b    - Show backend logs"
            echo "  frontend, f   - Show frontend logs"
            echo "  all           - Show all logs (default)"
            echo "  follow        - Follow logs in real-time"
            exit 1
            ;;
    esac
}

# Main function
main() {
    echo "=========================================="
    echo "    HMS Logs Script"
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
