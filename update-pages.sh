#!/bin/bash
# Script to update GitHub Pages settings via GitHub API
# Requires: GITHUB_TOKEN environment variable with repo:admin scope

REPO="gvgle/pvz-klf"

if [ -z "$GITHUB_TOKEN" ]; then
    echo "Error: GITHUB_TOKEN environment variable not set"
    echo "Get a token from: https://github.com/settings/tokens"
    echo "Required scope: repo"
    echo ""
    echo "Then run: GITHUB_TOKEN=your_token ./update-pages.sh"
    exit 1
fi

curl -X PATCH \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/$REPO/pages \
  -d '{"source": {"branch": "gh-pages", "path": "/"}}'

echo ""
echo "Done! The site should be available in 1-2 minutes."
