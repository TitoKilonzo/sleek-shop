# Sleek Shop

Online store for bags, footwear, technology and everyday accessories, built for customers in Kenya.
One installable web app (PWA) with a public storefront, customer accounts and a full admin console.
Prices are in Kenyan Shillings. Customers pay on delivery with cash or M-Pesa.

## What it includes

* **Storefront:** home, shop with search and sorting, product pages, saved items, bag, guest or signed in checkout, order confirmation, help pages and contact form.
* **Customer area:** register and sign in, order history with a progress tracker, profile and password change.
* **Admin console:** dashboard with revenue chart, orders (status updates, CSV export), products (add, edit, hide, delete, upload photos), customers, messages and subscribers, store settings.
* **PWA:** an install popup on open (closes with the X icon). Works on Android, Windows, macOS, ChromeOS and iPhone/iPad (Add to Home Screen steps). Works offline after the first visit.
* **Roles:** administrator, manager, customer.

Two ways to run, same screens:

| Mode | Data | Needs |
| --- | --- | --- |
| Demo | Hard coded data saved in the browser | Nothing |
| Live | **Turso** database through the built in API | A Turso database |

## Project layout

```
src/        web app (pages, components, PWA)
server/     API (Express + Turso)
api/        Vercel entry that runs the API
shared/     types and demo data used by both
scripts/    seed, admin creation, image download
public/     icons and photographs
tests/      API tests
```

Everything lives in one project and deploys as one Vercel site. There is no second server to host.

## Run it on your computer

Needs Node.js 20 or newer.

```bash
npm install
npm run dev          # http://localhost:5173, demo mode, no setup
```

The first run downloads the product photographs into `public/images`.

To try the live mode locally (uses a local database file, no Turso account needed):

```bash
cp .env.example .env
npm run db:seed
npm run dev:full     # API and web together, http://localhost:5173
```

### Demo sign ins

These exist only in demo mode or after `npm run db:seed`. They are not shown in the app. Email is not case sensitive.

| Role | Email | Password |
| --- | --- | --- |
| Administrator | `Admin@sleekshop.com` | `Sleekshop@123` |
| Store manager | `Manager@sleekshop.com` | `Sleekshop@123` |
| Customer | `Customer@sleekshop.com` | `Sleekshop@123` |
| Customer | `Amina@sleekshop.com` | `Sleekshop@123` |

## Host it on Vercel (3 steps)

**1. Create the Turso database** (once, from your computer):

```bash
turso auth login
turso db create sleek-shop
turso db show sleek-shop --url        # copy the libsql://... address
turso db tokens create sleek-shop     # copy the token
```

**2. Load products and create your admin** (once, from your computer, in this project folder):

```bash
npm install
export TURSO_DATABASE_URL="libsql://..."
export TURSO_AUTH_TOKEN="..."
npm run db:seed -- --catalogue-only
npm run admin:create -- owner@yourdomain.com "Your Name" "a-long-unique-password"
```

On Windows PowerShell use `$env:TURSO_DATABASE_URL="libsql://..."` and `$env:TURSO_AUTH_TOKEN="..."`.

**3. Import the repository in Vercel.**
Leave Root Directory empty (the repository root) and the preset on Vite. Add three environment variables, then Deploy:

| Name | Value |
| --- | --- |
| `TURSO_DATABASE_URL` | the `libsql://...` address |
| `TURSO_AUTH_TOKEN` | the token |
| `VITE_USE_API` | `true` |

Open the site on its HTTPS address. Check `https://your-site.vercel.app/api/health` shows `ok`, then sign in with the admin you created.
Changing any variable needs a redeploy (Deployments, Redeploy).

**Demo only site:** skip steps 1 and 2 and add no variables. The site runs on the hard coded data in each visitor's browser.
Good for showing the product, not for real orders.

Do not use `db:seed` without `--catalogue-only` on a real site, because it adds the demo accounts.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Web app (demo mode unless `VITE_USE_API=true` in `.env`) |
| `npm run dev:full` | API and web together |
| `npm run build` / `npm start` | Production build and local preview |
| `npm run db:seed` | Demo data (`-- --catalogue-only` products only, `-- --force` wipe first) |
| `npm run db:reset` | Wipe and reload demo data |
| `npm run admin:create -- <email> "<name>" <password> [admin\|manager]` | Create or update a staff account |
| `npm run images` | Download product photographs |
| `npm run typecheck` / `npm test` | Checks and API tests |
| `npm audit --audit-level=low` | Verify installed dependencies have no known vulnerabilities |

## Environment variables

| Name | Meaning |
| --- | --- |
| `VITE_USE_API` | `true` to use the Turso API. Leave unset for demo mode. |
| `TURSO_DATABASE_URL` | `libsql://` address (or `file:./data/sleek.db` locally) |
| `TURSO_AUTH_TOKEN` | Turso token |
| `SESSION_DAYS` | Sign in lifetime, default 7 |
| `WEB_ORIGIN` | Only if the web app is hosted on a different address than the API |

## Customising

* Products and demo accounts: `shared/catalog.ts`, `shared/demo.ts`. On a live site manage products in the admin console.
* Store name, contact details, delivery fee: Admin, Settings.
* Photographs: list in `shared/images.ts`; replace files in `public/images` with your own.
* Colours: variables at the top of `src/styles.css`. Help page text: `src/pages/InfoPage.tsx`.

## Troubleshooting

* **Photos are grey:** run `npm run images` while online, then redeploy.
* **Sign in fails after deploy:** confirm `VITE_USE_API=true` was added and the site was redeployed, then check `/api/health` and `/api/ready`.
* **`/api/ready` says not ready:** the Turso address or token is wrong.
* **Install popup missing:** it needs HTTPS or localhost, a supported browser, and never shows once installed.
* **Old version showing:** close and reopen the app once; it updates itself.

## Security and licence

Passwords use scrypt, sessions use random tokens stored as digests, roles are checked on every route, orders are priced and stock checked on the server. See [docs/security.md](docs/security.md) and [docs/architecture.md](docs/architecture.md).
Product photographs come from Unsplash. Check their licence terms and replace them with your own before a commercial launch.
