---
name: fluxbless-deploy
description: Guidelines and specifications for setting up multi-container docker deployments with Nginx routing, Redis caching, and Ubuntu automation scripts.
---

# FluxBless Docker Deployment Guidelines

This skill handles writing deployment scripts and compose topologies for the production site.

## Docker Topology
The project will run inside a single Docker network with the following containers:

```
                          ┌──────────────┐
                          │ Nginx Proxy  │ (Ports 80 / 443)
                          └──────┬───────┘
                                 │
         ┌───────────────────────┼──────────────────────┐
         ▼                       ▼                      ▼
 ┌──────────────┐        ┌──────────────┐        ┌──────────────┐
 │ Next.js App  │        │ Arco Admin   │        │ NestJS API   │
 │ (Frontend)   │        │ (Static/SPA) │        │ (Backend)    │
 └──────────────┘        └──────────────┘        └──────┬───────┘
                                                        │
                                          ┌─────────────┴─────────────┐
                                          ▼                           ▼
                                   ┌──────────────┐            ┌──────────────┐
                                   │  MySQL DB    │            │  Redis Cache │
                                   └──────────────┘            └──────────────┘
```

## Docker Compose Setup

A single root `docker-compose.yml` should define:
- **`mysql`**: Official MySQL 8.0, persistent volumes mounted.
- **`redis`**: Official Redis alpine, configured for caching product queries.
- **`backend`**: Node production build running the NestJS API. Depends on MySQL.
- **`frontend`**: Next.js production build.
- **`admin`**: Static Nginx container or node server hosting Arco Design SPA.
- **`nginx`**: Front-facing proxy routing domain requests:
  - `/` -> Frontend Next.js container (Port 3000)
  - `/admin` -> Admin SPA container
  - `/api` -> Backend NestJS container (Port 4000)

## Configurations and Scripts

### 1. Nginx Reverse Proxy
- Configure `nginx.conf` with Gzip compression, rate-limiting, and headers for client IP extraction (`X-Real-IP`, `X-Forwarded-For`).

### 2. Auto-Deployment Script (`deploy.sh`)
Write an automated deployment script that:
1. Pulls the latest code from the git repository.
2. Checks `.env` configuration.
3. Builds changed docker images (`docker-compose build`).
4. Runs database migrations inside the backend container (`npx prisma migrate deploy`).
5. Restarts containers with minimal downtime (`docker-compose up -d`).
6. Prunes old docker assets to save disk space (`docker image prune -f`).
