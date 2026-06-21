---
name: fluxbless-backend
description: Guidelines and specifications for building the NestJS backend API, covering modules, authentication, logging, internationalization, and payment integration.
---

# FluxBless NestJS Backend Guidelines

This skill guides development of the NestJS application under `backend/`.

## Architecture & Structure
The backend should be a modular NestJS application organized as follows:

```
backend/
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   ├── auth/            # Auth handles register, login, JWT issuance & verification
│   ├── users/           # User administration (roles: user, admin)
│   ├── products/        # Product search, category filtering, management
│   ├── categories/      # Category management
│   ├── cart/            # Client-side persistent cart synchronization
│   ├── orders/          # Order checkout, calculations, status tracking
│   ├── payment/         # Stripe checkout integrations & webhooks
│   ├── logger/          # Custom logger saving exceptions and server activity
│   └── prisma/          # Database access module wrapping PrismaClient
├── prisma/
│   ├── schema.prisma    # Prisma DB Schema
│   └── seed.ts          # Database seed script
├── .env.example
└── package.json
```

## Core Implementation Steps

### 1. Prisma Integration
Inject database connections using a custom `PrismaService` extending `PrismaClient` with shutdown hook management.

### 2. Authentication (JWT + Guard)
- Admin and standard users should both register/login via standard email/password endpoints.
- Secure admin endpoints using custom `@Roles('admin')` decorator and `RolesGuard` paired with a JWT verification strategy.

### 3. Log Tracking, System Errors and Sentry
- **Sentry Setup**:
  - Install `@sentry/nestjs` in the backend.
  - In `main.ts`, initialize Sentry before launching the NestJS app:
    ```ts
    import * as Sentry from '@sentry/nestjs';
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 1.0,
    });
    ```
  - Apply the Sentry global interceptor (`Sentry.BaseExceptionFilter` or similar) to automatically capture uncaught server exceptions.
- Implement a global `HttpExceptionFilter` to capture exceptions, formatting standard error payloads:
  ```json
  {
    "statusCode": 400,
    "timestamp": "2026-06-18T22:45:00.000Z",
    "path": "/api/orders/checkout",
    "message": "Error details"
  }
  ```
- All `error` level exceptions must write directly to the `SystemLog` database table or file logs for auditing, and trigger Sentry reports (`Sentry.captureException()`).
- Provide a public `/api/logs/client` endpoint for the Next.js frontend to send crash or access telemetry.

### 4. Stripe Payment Integration
- Implement a Stripe webhook listener (`/api/payment/webhook`) to handle payment events asynchronously.
- Ensure the webhook validates raw signatures to update corresponding `Order` status to `paid`.

### 5. Internationalization (i18n)
- Return error messages in the appropriate language (Chinese or English) based on standard `Accept-Language` headers, or handle translation lookups in the frontend.
