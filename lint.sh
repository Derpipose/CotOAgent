#!/bin/bash

# Script to lint both frontend and backend
# This script runs ESLint on both CotOAgent-Front and CotOAgent-Back

set -e  # Exit on first error

echo "=========================================="
echo "Linting CotOAgent Frontend"
echo "=========================================="
cd CotOAgent-Front
pnpm lint
cd ..

echo ""
echo "=========================================="
echo "Linting CotOAgent Backend"
echo "=========================================="
cd CotOAgent-Back
pnpm lint
cd ..

echo ""
echo "=========================================="
echo "✅ All linting complete!"
echo "=========================================="
