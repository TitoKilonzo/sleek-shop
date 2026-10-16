# Sleek Shop — Full-stack commerce starter

A mobile-first retail storefront and marketplace foundation using the **Deep Berry** and **Vanilla Cloud** design system. The repository contains a React + TypeScript frontend, a Node.js/Express API, Turso/libSQL database schema and seed workflow, and Progressive Web App configuration.

> **Current release scope:** catalogue browsing, product details, search and category filters, client-side saved cart, cash-on-delivery order submission, API validation, Turso-backed product/order persistence, and PWA installability. This is a marketplace MVP foundation, not yet a fully launched multi-vendor platform. Authentication, seller portal, real M-Pesa/card payments, delivery-provider integrations, refunds/payouts and customer order history need to be implemented before a commercial launch.

## Theme and interface

- **Deep Berry:** `#5A2149`
- **Berry Dark:** `#3B1530`
- **Vanilla Cloud:** `#F8F3E8`
- **Vanilla Card:** `#FFFCF5`
- **Berry Pale:** `#F1E5ED`

The UI includes a responsive navigation bar, search, category discovery, product cards, product detail pages, cart, checkout, order confirmation and footer/newsletter interaction. Product photographs currently load from Unsplash URLs; replace or license assets appropriately for a live store.

## Requirements

- Node.js 20 or later
- npm 10 or later
- Optional production database: Turso/libSQL account

## Run locally

```bash
npm install
npm run dev
```

- Frontend: `http://localhost:5173`
- API: `http://localhost:4000`
- Health: `http://localhost:4000/api/health`
- Readiness: `http://localhost:4000/api/ready`
- Catalogue endpoint: `http://localhost:4000/api/v1/products`

With no Turso credentials, the API uses the bundled demo catalogue and accepts checkout submissions in **demo mode**. Demo orders are not persisted across restarts, demo stock is not decremented, and demo checkout does not represent real payment. Configure Turso for durable production product and order storage.

## Environment

Copy `.env.example` to the repository root as `.env` (or to `apps/api/.env`) for local API settings. The API loader checks both locations.

```env
NODE_ENV=development
PORT=4000
WEB_ORIGIN=http://localhost:5173
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=
API_RATE_LIMIT_WINDOW_MS=900000
API_RATE_LIMIT_MAX=300
ORDER_RATE_LIMIT_MAX=20
```

Frontend configuration in `apps/web/.env.local` or Vercel:

```env
VITE_API_URL=http://localhost:4000
```

Only put public values in `VITE_*` variables. **Never expose** the Turso token, payment credentials or session secrets in frontend environment variables.

## Turso setup

1. Create a Turso database and obtain its database URL and auth token.
2. Set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` in your root `.env` or `apps/api/.env` local API environment.
3. Run the idempotent schema and seed script from the repository root:

   ```bash
   npx tsx apps/api/src/seed.ts
   ```

4. Start the API and check `/api/health`. Its `database` field should be `turso`.

Schema is in `database/schema.sql`. The seed script adds the curated launch categories and twelve sample catalogue rows. Sample products, brands, ratings and prices are illustrative content and must be verified or replaced before a real launch.

## Build and tests

```bash
npm run typecheck
npm test
npm run build
```

## Deploy the frontend to Vercel

1. Push the repository to GitHub.
2. Import the repo into Vercel.
3. Set the project **Root Directory** to `apps/web` if deploying the frontend as a separate Vercel project. Because this repository uses npm workspaces, Vercel may require the repository root to install workspace dependencies; if using root as the project root, set the Build Command to `npm run build -w @sleek/web` and Output Directory to `apps/web/dist`.
4. Set `VITE_API_URL` to the deployed Render API origin, e.g. `https://your-sleek-api.onrender.com`.
5. Add your production domains and verify the PWA manifest, icon paths and client-side route fallback.

## Deploy the API to Render

1. Create a **Web Service** connected to this repository.
2. Use the repository root as the service root directory (recommended for npm workspaces).
3. Build Command: `npm install && npm run build -w @sleek/api`
4. Start Command: `npm run start -w @sleek/api`
5. Set `NODE_ENV=production`, `WEB_ORIGIN` to the exact Vercel/custom frontend origin(s), `TURSO_DATABASE_URL`, and `TURSO_AUTH_TOKEN`.
6. Configure Render health check path as `/api/health`.
7. Test the deployed `/api/health`, `/api/ready`, `/api/v1/categories`, `/api/v1/products`, and `POST /api/v1/orders` endpoints.

Render supplies the `PORT` environment variable; the API listens on `0.0.0.0` and uses it automatically. Do not hardcode a production port. For a Vercel custom domain and API subdomain, ensure `WEB_ORIGIN` exactly matches the browser origin.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Liveness and current database mode |
| GET | `/api/ready` | Readiness check against required database |
| GET | `/api/v1/categories` | Available categories |
| GET | `/api/v1/products` | Catalogue with search/category/sort/limit/offset |
| GET | `/api/v1/products/:slug` | Product detail |
| POST | `/api/v1/orders` | Validate and create a cash-on-delivery order |

Catalogue query parameters: `search`, `category`, `sort` (`featured`, `price-asc`, `price-desc`, `rating`), `limit` (1–48), `offset` (0 or greater).

Order totals are recalculated server-side using product prices from the API/database. Delivery is currently configured as KES 350 below KES 7,500 and free at or above KES 7,500; treat these as sample business rules, not a final delivery policy. With a Turso connection, the order insert and stock decrement occur inside a write transaction. Production checkout should also add order idempotency, reservations/expiry, stronger abuse controls, actual payment verification and comprehensive integration tests.

## Architecture boundaries

- `apps/web`: browser UI, route views, cart state, API client, Tailwind and PWA configuration.
- `apps/api`: Express HTTP layer, validation, rate limiting, product/order route modules and store adapter.
- `database/schema.sql`: relational schema, indexes, stock/order/payment metadata and audit-related foundations.
- `docs`: architecture, security and deployment notes.

The API is a **modular monolith** by design. Split background jobs or services only when actual traffic and operational needs justify the extra complexity.

## Production-readiness checklist

Before accepting real money or customer data, implement and test:

- Authentication, email/phone verification, secure session lifecycle and role-based access control.
- Seller onboarding and seller-level data isolation.
- Idempotent checkout and payment callbacks; M-Pesa/card provider verification, refunds and reconciliation.
- Durable queue/worker for notifications and retryable integrations.
- Product variant/SKU inventory, stock reservations and expiry jobs.
- Delivery coverage/rates, return workflows, policies, support tools and order history.
- Backups/restore drills, monitoring, alerting, privacy policy, terms, incident response and secrets rotation.
- Automated API/integration/end-to-end/security/load tests against production-like infrastructure.

## Accessibility and performance

The UI is responsive, uses semantic labels and visible keyboard focus states, supports reduced-motion preferences, lazy-loads catalogue images and caches selected static assets and remote product images via the PWA service worker. Offline mode is not designed to submit orders, confirm stock or process payments. Product and account data must not be treated as authoritative while offline.
