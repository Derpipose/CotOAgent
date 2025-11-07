#!/bin/sh

echo "=== Container startup debug info ==="
echo "Resolv.conf:"
cat /etc/resolv.conf
echo ""
echo "Nginx config resolver line:"
grep "resolver " /etc/nginx/nginx.conf
echo ""
echo "Starting nginx..."
exec nginx -g "daemon off;"
