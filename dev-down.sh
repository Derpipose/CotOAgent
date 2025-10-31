#!/bin/bash

# Stop and remove all CotOAgent containers and networks
echo "🛑 Stopping CotOAgent Development Environment..."

docker-compose -f docker-compose.dev.yml down

echo "✅ Development environment stopped and cleaned up."
