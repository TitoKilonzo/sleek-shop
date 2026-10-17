# Sleek Shop

Sleek Shop is an online store for bags, footwear, technology and everyday accessories, built for customers in Kenya.
It combines a public storefront, customer accounts and a full admin console in one installable web app (PWA).
Prices are in Kenyan Shillings and customers pay on delivery with cash or M-Pesa.

## About the system

**Storefront.** Home page, category browsing, search, sorting, product pages with related items, saved items,
shopping bag with a free delivery progress bar, guest or signed in checkout, order confirmation, help pages
(delivery, returns, privacy, terms) and a contact form.

**Customer area.** Registration and sign in, account overview, order history with a progress tracker, and a profile page
with delivery details and password change. Checkout is pre filled for signed in customers.

**Admin console.** A professional side navigation and top bar with:

* Dashboard: revenue, orders, customers, low stock, a 14 day revenue chart, orders by status, top products and stock alerts
* Orders: filter by status, search, full order detail, status updates (cancelling restores stock), CSV export
* Products: add, edit, hide, delete, upload a photo or use an image link, stock and pricing
* Customers: order counts, total spent, account activation
* Messages: contact enquiries (read, reply by email, delete) and newsletter subscribers
* Settings (administrator only): store details, delivery fee, free delivery threshold, low stock level

**Installable app.** When the site is opened, a popup offers to install it. It closes with the X icon. It works on Android,
Windows, macOS and ChromeOS through the browser install prompt, and on iPhone and iPad through a short instruction card.
After installing, the app opens full screen and keeps working offline.

**Two ways to run.**

| Mode | What it is | Needs |
| --- | --- | --- |
| Demo | All data is hard coded in the app and saved in the browser. | Nothing. Runs locally and on any static host. |
| Production | The API stores everything in a **Turso** database, shared by every visitor and every device. | A Turso database and a Node host for the API. |

The screens are identical in both modes. The app switches to production mode when `VITE_API_URL` is set.

## Tech stack

* Web: React 18, TypeScript, Vite, React Router, `vite-plugin-pwa` (Workbox), Lucide icons, self hosted fonts
* API: Node 20+, Express, Zod, `@libsql/client`, scrypt password hashing
* Database: Turso (libSQL / SQLite)
* Tests and CI: Vitest integration tests, GitHub Actions

## Project structure

```
sleek-shop/
  apps/
    web/                 Storefront, customer area, admin console, PWA
      public/            Icons, robots.txt, photographs (images/)
      scripts/           fetch-images.mjs
      src/
        components/      Navbar, Footer, UserMenu, Console shell, InstallPrompt, Boot, SmartImage
        lib/             db.ts (data layer), remote.ts (API client), store.ts, pwa.ts
        pages/           Storefront pages, account/ and admin/
        styles.css
    api/                 Express API for Turso
      src/
        db/              schema, client, seed, migrate, create-admin
        lib/ middleware/ routes/ services/
      test/              API integration tests
  packages/
    shared/              Types, demo data and image manifest used by both apps
  docs/                  architecture.md, deployment.md, security.md
  .github/workflows/     ci.yml
  vercel.json  netlify.toml  render.yaml  .env.example
```

## Getting started (demo mode)

Requirements: Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:5173. No database or configuration is needed.

The first run downloads the product photographs into `apps/web/public/images` so every image is served from the app itself.
If you are offline the app falls back to the original image source until you run `npm run images` with a connection.

To test the production build, including the install popup and offline mode:

```bash
npm run build
npm start          # http://localhost:4173
```

### Demo sign ins

Demo accounts exist for testing the different roles. They are not shown anywhere in the app. All use the same password.

| Role | Email | Password |
| --- | --- | --- |
| Administrator | `Admin@sleekshop.com` | `Sleekshop@123` |
| Store manager | `Manager@sleekshop.com` | `Sleekshop@123` |
| Customer | `Customer@sleekshop.com` | `Sleekshop@123` |
| Customer | `Amina@sleekshop.com` | `Sleekshop@123` |

Email addresses are not case sensitive. Remove these accounts from any real deployment (see Production below).

Roles: customers see only their own orders; managers can manage orders, products, customers and messages;
the administrator can also change settings, delete products and deactivate customers.

## Running with Turso

1. Install the Turso CLI and create a database:

   ```bash
   turso auth login
   turso db create sleek-shop
   turso db show sleek-shop --url        # libsql://...
   turso db tokens create sleek-shop     # token
   ```

2. Copy `.env.example` to `.env` in the repository root and set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`
   (or keep the default `file:./data/sleek.db` to develop against a local file without a Turso account).

3. Load data and start both servers:

   ```bash
   npm run db:seed          # demo catalogue, accounts, orders and messages
   echo "VITE_API_URL=http://localhost:4000" > apps/web/.env
   npm run dev:full         # API on :4000, web on :5173
   ```

The API creates or updates the tables automatically every time it starts.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Web app in development (demo mode unless `VITE_API_URL` is set) |
| `npm run dev:api` | API in development |
| `npm run dev:full` | API and web together |
| `npm run build` / `npm start` | Build and serve the web app |
| `npm run build:api` / `npm run start:api` | Build and run the API |
| `npm run db:migrate` | Apply the schema |
| `npm run db:seed` | Load demo data (`-- --catalogue-only` for products only, `-- --force` to wipe first) |
| `npm run db:reset` | Wipe and reload the demo data |
| `npm run admin:create -- <email> "<name>" <password> [admin\|manager]` | Create or update a staff account |
| `npm run images` | Download the product photographs |
| `npm run typecheck` / `npm test` | Type checks and API tests |

## Environment variables

API (`.env` in the repository root or `apps/api`):

| Variable | Default | Meaning |
| --- | --- | --- |
| `TURSO_DATABASE_URL` | `file:./data/sleek.db` | `libsql://` URL of your Turso database |
| `TURSO_AUTH_TOKEN` | empty | Turso token (not needed for a local file) |
| `WEB_ORIGIN` | localhost addresses | Exact web addresses allowed to call the API, comma separated |
| `PORT` | `4000` | Port to listen on |
| `SESSION_DAYS` | `7` | Sign in lifetime |
| `API_RATE_LIMIT_MAX`, `LOGIN_RATE_LIMIT_MAX`, `ORDER_RATE_LIMIT_MAX` | `600`, `20`, `30` | Requests allowed per 15 minutes |
| `DEMO_PASSWORD` | `Sleekshop@123` | Password given to demo accounts by `db:seed` |

Web (`apps/web/.env`):

| Variable | Meaning |
| --- | --- |
| `VITE_API_URL` | API address. Leave empty for demo mode. This value is public, never put secrets in it. |

## Production hosting

Recommended: **Turso** (database) + **Render** (API) + **Vercel** (web). The short version:

1. Create the Turso database and note the URL and token.
2. From your machine seed it with production safe data and create your administrator:

   ```bash
   export TURSO_DATABASE_URL="libsql://..."
   export TURSO_AUTH_TOKEN="..."
   npm run db:seed -- --catalogue-only
   npm run admin:create -- owner@yourdomain.com "Your Name" "a-long-unique-password"
   ```

3. Deploy the API on Render using `render.yaml`. Set `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` and `WEB_ORIGIN`
   (your web address). Check `https://<api>/api/health`.
4. Deploy the web app on Vercel from the repository root. Set `VITE_API_URL` to the API address.
5. Open the site on HTTPS and confirm the install popup appears.

Netlify and any static host also work for the web app (`netlify.toml` is included). A demo only site with no backend
is just step 4 without `VITE_API_URL`. Full instructions, the smoke test checklist and backup advice are in
[docs/deployment.md](docs/deployment.md).

## Installing the app on a device

* **Android, Windows, macOS, ChromeOS (Chrome, Edge, Brave):** use the install popup, or the install icon in the address bar.
* **iPhone and iPad (Safari):** tap Share, then Add to Home Screen. The popup shows these steps.
* **Offline:** after the first visit the storefront, product pages and photographs open without a connection. Ordering needs a connection in production mode.

The install requires HTTPS or `localhost`. Icons live in `apps/web/public/icons` (standard and maskable sizes).
The popup is shown once per visit and is hidden when the app is already installed.

## Customising

* Products, categories and demo accounts: `packages/shared/src` (`catalog.ts`, `demo.ts`). In production manage products in the admin console.
* Photographs: `packages/shared/src/images.json` lists each file and its source. Replace files in `apps/web/public/images` with your own.
* Store name, contact details, delivery fee and free delivery threshold: Admin console, Settings.
* Colours and layout: CSS variables at the top of `apps/web/src/styles.css`.
* Help page text: `apps/web/src/pages/InfoPage.tsx`.

## Security

Passwords use scrypt, sessions use random tokens stored as digests, every route checks the user's role, orders are priced
and stock checked on the server, and requests are validated and rate limited. See [docs/security.md](docs/security.md)
for the full list and what to add before taking online payments.

## Troubleshooting

* **Photos show a grey placeholder:** run `npm run images` while online, then rebuild.
* **The install popup does not appear:** use HTTPS or localhost, a supported browser, and clear the previous choice by opening a new tab (it is remembered per visit). It never shows once the app is installed.
* **After an update the old version appears:** the app updates itself. Close and reopen it once, or hard refresh.
* **Sign in works locally but not when hosted:** check that `WEB_ORIGIN` on the API exactly matches the web address (no trailing slash) and that `VITE_API_URL` is set on the web host and the site was redeployed.
* **Reset demo mode data:** sign in as the administrator, Settings, Restore demo data. Or clear the site data in the browser.

## Licence and credits

Product photographs are loaded from Unsplash. Check the licence terms for each photograph and replace them with your own
before a commercial launch.
