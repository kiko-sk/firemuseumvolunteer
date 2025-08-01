#!/bin/bash
set -e

echo "Installing dependencies..."
npm install --legacy-peer-deps

echo "Setting environment variables..."
export ESBUILD_MINIFY_IIFE=true
export NODE_ENV=production

echo "Building project with force flag..."
npm run build --force

echo "Build completed successfully!" 