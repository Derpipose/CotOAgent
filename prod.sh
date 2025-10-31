#!/bin/bash

# Production Docker Compose Script
echo "🚀 Starting CotOAgent Production Environment..."

# Build and start production containers
docker-compose -f docker-compose.yml up --build

echo "✅ Production environment stopped."
