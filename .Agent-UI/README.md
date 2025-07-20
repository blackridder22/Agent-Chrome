# Agent UI - Docker Setup

This directory contains the Docker configuration for the Agent UI React application.

## Prerequisites

- Docker installed on your system
- Docker Compose (optional, for easier management)

## Building and Running

### Option 1: Using Docker Compose (Recommended)

```bash
# Build and start the application
docker-compose up --build

# Run in detached mode
docker-compose up -d --build

# Stop the application
docker-compose down
```

### Option 2: Using Docker directly

```bash
# Build the image
docker build -t agent-ui .

# Run the container
docker run -d -p 4750:80 -v agent-ui-data:/usr/share/nginx/html/data --name agent-ui agent-ui

# Run in detached mode
docker run -d -p 4750:80 --name agent-ui -d

# Stop and remove the container
docker stop agent-ui
docker rm agent-ui
```

## Accessing the Application

Once running, the application will be available at:
- http://localhost:4750

## Data Persistence

The application uses a Docker volume to persist conversation data:
- Volume name: `agent-ui-data`
- Mount point: `/usr/share/nginx/html/data`
- Purpose: Stores chat sessions, webhooks, and user settings

### Managing Data

```bash
# View volume information
docker volume inspect agent-ui-data

# Backup data
docker run --rm -v agent-ui-data:/data -v $(pwd):/backup alpine tar czf /backup/agent-ui-backup.tar.gz -C /data .

# Restore data
docker run --rm -v agent-ui-data:/data -v $(pwd):/backup alpine tar xzf /backup/agent-ui-backup.tar.gz -C /data

# Remove volume (WARNING: This will delete all data)
docker volume rm agent-ui-data
```

## Environment Variables

For production deployment, you may need to configure environment variables for:
- Supabase configuration
- Stripe API keys
- OpenRouter API keys

Add these to a `.env` file or pass them directly to the Docker container.

## Production Deployment

For production deployment:

1. Set appropriate environment variables
2. Configure proper domain and SSL certificates
3. Consider using a reverse proxy (nginx, traefik, etc.)
4. Set up proper logging and monitoring

## File Structure

- `Dockerfile` - Multi-stage Docker build configuration
- `docker-compose.yml` - Docker Compose configuration
- `nginx.conf` - Nginx configuration for serving the React SPA
- `.dockerignore` - Files to exclude from Docker build context