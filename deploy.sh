#!/bin/bash
# FluxBless Automated Deployment Script

set -e

echo "========================================="
echo "🪐 Deploying FluxBless Production Aura..."
echo "========================================="

# 1. Pull latest code (if inside a git repository)
if [ -d .git ]; then
  echo "📥 Pulling latest codebase updates..."
  git pull origin main || echo "⚠️ Warning: git pull failed, deploying current local files."
else
  echo "ℹ️ Note: Not a git repository, deploying current local directory state."
fi

# 2. Build docker images
echo "🏗️ Building updated container images..."
docker-compose build

# 3. Apply database migrations inside the backend container
echo "🗄️ Running Prisma migrations in database..."
docker-compose run --rm backend npx prisma migrate deploy

# 4. (Optional) Run Database Seeding if fresh database is needed
# echo "🌱 Seeding database..."
# docker-compose run --rm backend npx prisma db seed

# 5. Start or restart container instances
echo "🚀 Starting services in detached mode..."
docker-compose up -d

# 6. Clean up dangling images to save disk space
echo "🧹 Pruning unused Docker image assets..."
docker image prune -f

echo "========================================="
echo "🎉 Deployment successful! Aura is online."
echo "========================================="
