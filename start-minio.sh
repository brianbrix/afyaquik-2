#!/bin/bash

# Start MinIO Docker container
echo "Starting MinIO Docker container..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker first."
    exit 1
fi

# Start MinIO using docker-compose
docker-compose -f docker-compose.minio.yml up -d

echo "MinIO is starting up..."
echo "MinIO Console: http://localhost:9001"
echo "MinIO API: http://localhost:9000"
echo "Username: minioadmin"
echo "Password: minioadmin123"
echo ""
echo "Waiting for MinIO to be ready..."

# Wait for MinIO to be ready
timeout=60
counter=0
while [ $counter -lt $timeout ]; do
    if curl -s http://localhost:9000/minio/health/live > /dev/null 2>&1; then
        echo "MinIO is ready!"
        echo ""
        echo "You can now start your HMS application."
        echo "The diagnostic file uploads will be stored in MinIO."
        exit 0
    fi
    sleep 2
    counter=$((counter + 2))
done

echo "MinIO failed to start within $timeout seconds."
echo "Please check the logs: docker-compose -f docker-compose.minio.yml logs"
exit 1
