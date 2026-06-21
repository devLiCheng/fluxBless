---
name: fluxbless-frontend
description: Guidelines and specifications for the Next.js client-facing store. Covers premium "Tudou Gold" theme, i18n automatic browser detection, and error telemetry.
---

# FluxBless C-End Next.js Client-Facing Store

This skill directs development of the client application in `frontend/`.

## Architecture & Framework
- **Framework**: Next.js (App Router, React 19)
- **Styling**: Vanilla CSS or Tailwind CSS configured with a curated color system
- **State management**: React Context / Zustand for cart state

## Key Requirements & Features

### 1. Premium "Tudou Gold" (土豪金) Aesthetic
- Avoid basic, generic CSS rules. Create a premium aesthetic using:
  - **Colors**: Rich obsidian/charcoal backgrounds (`#121212`, `#1A1A1A`), warm gold accents (`#D4AF37`, `#C5A059`, `#AA7C11`), soft cream highlights (`#FAF9F6`).
  - **Typography**: Google Fonts combination of Serif titles (e.g., *Cinzel* or *Playfair Display* for spiritual elegance) and clean Sans-serif text (e.g., *Inter* or *Outfit*).
  - **Visual FX**: Glassmorphism (blurry gold borders, transparent cards), smooth transitions (0.3s ease-in-out), micro-animations (e.g., subtle glowing pulse on CTA buttons, zoom-in on product hover).
- Prevent standard templates. Implement distinct pages showing bracelets, agate, and cinnabar accessories.

### 2. Automatic i18n System (Chinese/English)
- **Automatic Detection**: Next.js middleware should check `Accept-Language` headers and user cookies to redirect or load the corresponding translations (Chinese default, English fallback).
- **Manual Toggle**: A sticky or navigation header button allowing seamless translation switches.
- Localized JSON dictionaries for both interfaces.

### 3. User Logs, Error Telemetry and Sentry
- **Analytics logging**: Trigger an anonymous API log request when a visitor lands on any page, keeping track of page performance.
- **Sentry Setup**:
  - Install `@sentry/nextjs` in the frontend.
  - Setup `sentry.client.config.ts`, `sentry.server.config.ts`, and `sentry.edge.config.ts` to initialize Sentry with the `NEXT_PUBLIC_SENTRY_DSN` environment variable.
- **Crash Logging**: Standard Next.js `error.js` capture blocks reporting exceptions to `backend/api/logs/client` and Sentry automatically.

### 4. Shopping Lifecycle Flow
- **Home**: Gold-themed Hero section explaining the brand motto: *"Let positive energy flow, attract endless blessings"*. Beautiful interactive product grid.
- **Details**: Full-page product display including zoomable image carousel, accessory sizing specs, spiritual meaning block, and Add to Cart.
- **Cart**: Slide-over drawer with subtotal calculations.
- **Checkout & Success**: Stripe payment page connecting to backend gateway, leading to a custom spiritual blessing success page displaying golden energy ripple animations.
