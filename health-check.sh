#!/bin/bash

# Health check script for HMS production deployment
# This script checks if all services are running and accessible

echo "🏥 HMS Health Check"
echo "=================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check HTTP status
check_url() {
    local url=$1
    local name=$2
    local expected_status=${3:-200}
    
    echo -n "Checking $name... "
    
    local status=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$status" = "$expected_status" ]; then
        echo -e "${GREEN}✅ OK (HTTP $status)${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED (HTTP $status)${NC}"
        return 1
    fi
}

# Function to check container status
check_container() {
    local container_name=$1
    local service_name=$2
    
    echo -n "Checking $service_name container... "
    
    if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "$container_name.*Up"; then
        echo -e "${GREEN}✅ Running${NC}"
        return 0
    else
        echo -e "${RED}❌ Not running${NC}"
        return 1
    fi
}

echo ""
echo "📦 Container Status"
echo "------------------"

# Check all containers
check_container "traefik" "Traefik"
check_container "hms-backend" "HMS Backend"
check_container "hms-frontend" "HMS Frontend"
check_container "hms-db" "PostgreSQL Database"

echo ""
echo "🌐 Service Accessibility"
echo "------------------------"

# Check services (with timeout)
export CURL_TIMEOUT=10

# Check main application
check_url "https://app.afyaquik.com" "Main Application"

# Check API
check_url "https://api.afyaquik.com/api/v1/health" "API Health"

# Check Traefik dashboard
check_url "https://traefik.afyaquik.com" "Traefik Dashboard"

echo ""
echo "🔒 SSL Certificate Status"
echo "-------------------------"

# Check SSL certificates
echo -n "Checking SSL certificates... "
if docker exec traefik cat /letsencrypt/acme.json 2>/dev/null | grep -q "afyaquik.com"; then
    echo -e "${GREEN}✅ Certificates found${NC}"
else
    echo -e "${YELLOW}⚠️  Certificates may be pending${NC}"
fi

echo ""
echo "📊 System Resources"
echo "-------------------"

# Check disk space
echo -n "Disk space: "
df -h / | tail -1 | awk '{print $4 " available"}'

# Check memory usage
echo -n "Memory usage: "
free -h | grep "Mem:" | awk '{print $3 "/" $2}'

# Check Docker stats
echo ""
echo "🐳 Docker Resource Usage"
echo "------------------------"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

echo ""
echo "📋 Summary"
echo "----------"

# Count successful checks
total_checks=0
passed_checks=0

# Container checks
for container in "traefik" "hms-backend" "hms-frontend" "hms-db"; do
    total_checks=$((total_checks + 1))
    if docker ps --format "{{.Names}}" | grep -q "$container"; then
        passed_checks=$((passed_checks + 1))
    fi
done

# Service checks
for url in "https://app.afyaquik.com" "https://api.afyaquik.com/api/v1/health" "https://traefik.afyaquik.com"; do
    total_checks=$((total_checks + 1))
    if curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null | grep -q "200"; then
        passed_checks=$((passed_checks + 1))
    fi
done

echo "Passed: $passed_checks/$total_checks checks"

if [ $passed_checks -eq $total_checks ]; then
    echo -e "${GREEN}🎉 All systems operational!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some issues detected. Check the output above.${NC}"
    exit 1
fi
