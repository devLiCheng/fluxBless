---
name: fluxbless-admin
description: Guidelines and specifications for the React administration panel built with ByteDance's Arco Design, managing items, categories, customer orders, and system logs.
---

# FluxBless Arco Design Admin Console

This skill governs development of the React management application under `admin/`.

## Framework & Dependencies
- **UI library**: Arco Design React (`@arco-design/web-react`)
- **State Management / Routing**: React Router v6
- **HTTP client**: Axios with automatic JWT interceptors
- **i18n**: Arco Design locale integration and custom dictionary toggle (Chinese/English)

## Core Panels & Layout

### 1. Main Dashboard
- High-level KPIs: Total sales, pending orders, item inventory warnings.
- Data visualization charts showing recent transaction trends.

### 2. Product Management (CRUD)
- Table listing all products with search, pagination, category filtering.
- Dual-input fields for bilingual attributes (`nameZh` and `nameEn`, `descriptionZh` and `descriptionEn`).
- Upload module for listing images.
- Stock adjustments and pricing changes.

### 3. Category Management
- CRUD list for accessory categories (e.g. 琉璃手串, 玛瑙, 白玉).

### 4. Order Control & Logistics
- Overview of all customer transactions.
- Filter panels: `pending`, `paid`, `shipped`, `completed`, `cancelled`.
- Action buttons to update status or record shipping tracking numbers.

### 5. System Logs & Crash Reports
- Read-only table fetching logs from `/api/logs/client` or the database system logs.
- Enables monitoring of C-end site health, page timeouts, and backend processing errors.

## Implementation Details
- Ensure all forms use Arco Design Form validation.
- Implement token refresh logic or direct user to `/login` if auth expires.
- Style should follow modern administration aesthetics, using Arco Design's dark/light modes.
