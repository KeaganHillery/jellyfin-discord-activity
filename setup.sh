#!/bin/bash

set -e

echo "======================================"
echo " Jellyfin Discord Watch Party Setup"
echo "======================================"
echo

if ! command -v docker >/dev/null 2>&1; then
    echo "ERROR: Docker is not installed."
    exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
    echo "ERROR: Docker Compose is not available."
    exit 1
fi

echo "Discord Application ID:"
read -r DISCORD_CLIENT_ID

echo
echo "Discord Bot Token:"
read -rs DISCORD_TOKEN
echo

echo
echo "Jellyfin URL (example: http://192.168.1.100:8096):"
read -r JELLYFIN_URL

echo
echo "Jellyfin API Key:"
read -rs JELLYFIN_API_KEY
echo

cat > .env <<ENV
DISCORD_TOKEN=$DISCORD_TOKEN
DISCORD_CLIENT_ID=$DISCORD_CLIENT_ID
JELLYFIN_URL=$JELLYFIN_URL
JELLYFIN_API_KEY=$JELLYFIN_API_KEY
ENV

chmod 600 .env

echo
echo "Configuration saved."
echo
echo "Building and starting Jellyfin Discord Watch Party..."
echo

docker compose up -d --build

echo
echo "======================================"
echo " Setup complete!"
echo "======================================"
echo
echo "Check the containers with:"
echo "  docker compose ps"
echo
echo "View logs with:"
echo "  docker compose logs -f"
echo
