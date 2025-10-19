#!/bin/bash

# Traefik SSL Setup Script for afyaquik.com
# This script sets up Traefik with SSL certificates for app.afyaquik.com and api.afyaquik.com

set -e

echo "🚀 Setting up Traefik with SSL for afyaquik.com..."

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p letsencrypt
mkdir -p traefik-config

# Set proper permissions for Let's Encrypt
echo "🔐 Setting up Let's Encrypt permissions..."
touch letsencrypt/acme.json
chmod 600 letsencrypt/acme.json

# Create Docker network
echo "🌐 Creating Docker network..."
docker network create traefik-network 2>/dev/null || echo "Network already exists"

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker compose down 2>/dev/null || echo "No existing containers to stop"

# Start Traefik
echo "🚀 Starting Traefik with SSL..."
docker compose up -d

# Wait for Traefik to start
echo "⏳ Waiting for Traefik to start..."
sleep 10

# Check if Traefik is running
if docker ps | grep -q traefik; then
    echo "✅ Traefik is running!"
    echo ""
    echo "🌐 Your services will be available at:"
    echo "   • Main Application: https://app.afyaquik.com"
    echo "   • API: https://api.afyaquik.com"
    echo "   • Traefik Dashboard: https://traefik.afyaquik.com"
    echo "   • Test service: https://test.afyaquik.com"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Update your DNS records to point to this server's IP"
    echo "   2. Replace 'your-hms-backend-image:latest' with your actual backend image"
    echo "   3. Replace 'your-hms-frontend-image:latest' with your actual frontend image"
    echo "   4. Update the email in traefik.yml to your actual email"
    echo ""
    echo "🔍 Check logs with: docker compose logs -f traefik"
else
    echo "❌ Traefik failed to start. Check logs with: docker compose logs traefik"
    exit 1
fi
