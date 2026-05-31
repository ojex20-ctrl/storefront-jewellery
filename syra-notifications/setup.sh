#!/bin/bash
# SYRA Notifications — Setup Script for Contabo VPS (Ubuntu)
# Run as root: bash setup.sh

set -e

echo "=== SYRA Notifications Setup ==="

# Install Docker if not present
if ! command -v docker &> /dev/null; then
  echo "Installing Docker..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
fi

# Install Docker Compose if not present
if ! command -v docker-compose &> /dev/null; then
  echo "Installing Docker Compose..."
  apt-get install -y docker-compose-plugin
fi

# Copy .env
if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env — EDIT THIS FILE with your credentials before continuing!"
  echo "Run: nano .env"
  exit 1
fi

# Start services
echo "Starting services..."
docker compose up -d --build

# Wait for DB
echo "Waiting for database..."
sleep 10

# Run migrations and seed
docker compose exec app npx prisma db push
docker compose exec app node src/seed.js

echo ""
echo "=== SETUP COMPLETE ==="
echo "App running on port 4000"
echo "Admin: ${ADMIN_EMAIL:-admin@syra.in} / ${ADMIN_PASSWORD:-adnan123}"
echo ""
echo "For SSL, run:"
echo "  docker compose run --rm certbot certonly --webroot -w /var/www/certbot -d YOUR_DOMAIN"
echo "  docker compose restart nginx"
