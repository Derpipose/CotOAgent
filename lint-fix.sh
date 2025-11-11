#!/bin/bash

# Script to lint and fix both frontend and backend
# This script runs ESLint with --fix flag on both CotOAgent-Front and CotOAgent-Back

set -e  # Exit on first error

echo "=========================================="
echo "Linting and fixing CotOAgent Frontend"
echo "=========================================="
cd CotOAgent-Front
pnpm lint:fix
cd ..

echo ""
echo "=========================================="
echo "Linting and fixing CotOAgent Backend"
echo "=========================================="
cd CotOAgent-Back
pnpm lint:fix
cd ..

echo ""
echo "=========================================="
echo "✅ All linting and fixing complete!"
echo "=========================================="
