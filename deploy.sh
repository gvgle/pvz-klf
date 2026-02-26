#!/bin/bash
# Deployment script for pvz.guagle.com

echo "Building project..."
npm run build

echo "Deploying to GitHub Pages..."
gh-pages -d dist --dotfiles=true

echo "Deployment complete! Your site should be available at:"
echo "https://pvz.guagle.com/"
echo ""
echo "It may take 1-2 minutes for the changes to propagate."
