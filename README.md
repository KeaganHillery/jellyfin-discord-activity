# Jellyfin Discord Watch Party

A self-hosted Discord Activity for browsing and watching movies from a Jellyfin server directly inside Discord.

## Features

- Jellyfin movie library
- Movie posters and details
- Direct video playback
- Discord `/watch` command
- Docker deployment
- Cloudflare Tunnel support

## Requirements

- Linux server
- Docker + Docker Compose
- Jellyfin server
- Discord application and bot
- Jellyfin API key

## Quick Setup

Clone the repository:

    git clone https://github.com/KeaganHillery/jellyfin-discord-activity.git
    cd jellyfin-discord-activity

Run the setup script:

    ./setup.sh

The setup script will ask for your Discord Application ID, Discord Bot Token, Jellyfin URL and Jellyfin API key.

It will then create the `.env` file and start the Docker containers automatically.

## Discord Setup

Create an application in the Discord Developer Portal and enable Activities.

Configure the Activity URL mapping to point to your public HTTPS Activity URL.

Invite the bot to your Discord server, then use:

    /watch

## Updating

Pull the latest version and rebuild:

    git pull
    docker compose up -d --build

## Security

Never commit `.env`, Discord tokens or Jellyfin API keys.

The Jellyfin API key is kept on the server and is not exposed to the Activity frontend.

## Project Structure

    activity/   Discord Activity frontend
    bot/        Discord bot
    server/     Jellyfin backend
    setup.sh    Interactive setup script

## License

MIT License.

## Disclaimer

Not affiliated with Discord, Jellyfin or Cloudflare.

This project does not provide or distribute media. Users are responsible for ensuring they have the appropriate rights to their media.
