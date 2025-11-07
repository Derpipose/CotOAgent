#!/bin/sh
set -e

# Get the DNS server IP from /etc/resolv.conf
DNS_SERVER=$(grep nameserver /etc/resolv.conf | head -n1 | awk '{print $2}')

# If we got a DNS server, update nginx config with it
if [ -n "$DNS_SERVER" ]; then
    echo "Using DNS server: $DNS_SERVER"
    sed -i "s/resolver valid=10s;/resolver $DNS_SERVER valid=10s;/" /etc/nginx/nginx.conf
fi

# Start nginx
exec nginx -g "daemon off;"
