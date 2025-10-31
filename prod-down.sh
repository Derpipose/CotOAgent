#!/bin/bash

# Stop and remove all CotOAgent containers and networks
echo "🛑 Stopping CotOAgent Production Environment..."

docker-compose -f docker-compose.yml down

echo "✅ Production environment stopped and cleaned up."
