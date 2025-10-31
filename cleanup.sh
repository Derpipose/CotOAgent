#!/bin/bash

# Clean up Docker resources for CotOAgent
echo "🧹 Cleaning up CotOAgent Docker resources..."

# Stop all containers
docker-compose -f docker-compose.dev.yml down 2>/dev/null
docker-compose -f docker-compose.yml down 2>/dev/null

# Remove unused images, containers, and networks
docker system prune -f

# Remove CotOAgent specific images (optional - uncomment if needed)
# docker rmi cotoagent-front cotoagent-back 2>/dev/null

echo "✅ Docker cleanup completed."
