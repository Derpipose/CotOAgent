#!/bin/bash

# Development Docker Compose Script
echo "🚀 Starting CotOAgent Development Environment..."

# Build and start development containers
docker-compose -f docker-compose.dev.yml up --build

echo "✅ Development environment stopped."
