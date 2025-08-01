#!/bin/bash
set -e

echo "Installing dependencies..."
npm install --legacy-peer-deps

echo "Setting environment variables..."
export ESBUILD_MINIFY_IIFE=true

echo "Building project..."
npm run build

echo "Build completed successfully!" 