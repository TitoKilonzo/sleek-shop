# Deployment

Production layout: **Vercel (web) + Render (API) + Turso (database)**. Any static host works for the web app and any
Node host works for the API.

## 1. Create the Turso database

```bash
# Install the Turso CLI: https://docs.turso.tech/cli/installation
turso auth login
turso db create sleek-shop
turso db show sleek-shop --url          # libsql://sleek-shop-<org>.turso.io
turso db tokens create sleek-shop       # the auth token
```

Keep the URL and token private. They belong only in the API's environment.

## 2. Load the first data (from your own machine)

```bash
npm install
export TURSO_DATABASE_URL="libsql://sleek-shop-<org>.turso.io"
export TURSO_AUTH_TOKEN="<token>"

npm run db:seed -- --catalogue-only                       # products and store settings, no demo accounts
npm run admin:create -- owner@yourdomain.com "Your Name" "a-long-unique-password"
```

Use `npm run db:seed` (without the flag) only for demos and staging. It adds the demo accounts, orders and messages.
`npm run db:reset` wipes and reloads the demo data.

## 3. Deploy the API to Render

1. Push the repository to GitHub.
2. In Render choose **New > Blueprint** and select the repository (it reads `render.yaml`), or create a Web Service manually:
   * Build command: `npm install --include=dev && npm run build:api`
   * Start command: `npm run start:api`
   * Health check path: `/api/health`
3. Set the environment variables:

| Variable | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `TURSO_DATABASE_URL` | your `libsql://` URL |
| `TURSO_AUTH_TOKEN` | your token |
| `WEB_ORIGIN` | the exact web address, for example `https://sleekshop.vercel.app` (comma separate several) |

4. Open `https://<your-api>.onrender.com/api/health`. You should see `{"status":"ok"}`.
   `/api/ready` also checks the database connection.

## 4. Deploy the web app to Vercel

1. Import the repository. Keep the project root at the repository root; `vercel.json` sets the commands.
2. Add the environment variable `VITE_API_URL` with your API address, for example `https://sleek-shop-api.onrender.com`.
3. Deploy. The build downloads the product photographs into the site so they are served from your own domain.

For Netlify, `netlify.toml` is included (build `npm run build`, publish `apps/web/dist`). For any other static host,
run `npm run build` and upload `apps/web/dist`, with every unknown path rewritten to `/index.html`.

Update `WEB_ORIGIN` on the API whenever the web address changes, then redeploy the API.

## Demo only deployment (no backend)

Skip steps 1 to 3 and do not set `VITE_API_URL`. The site runs on the hard coded demo data stored in each visitor's
browser. Good for showing the product, not for real orders because nothing is shared between visitors.

## HTTPS and installability

The PWA install prompt appears only on HTTPS (or `localhost`). Vercel, Netlify and Render provide HTTPS automatically.

## Smoke test after every deployment

1. `GET /api/health` returns `ok` and `GET /api/ready` returns `ready`.
2. The storefront lists products and photographs load from your own domain.
3. Place a test order as a guest. It appears in the admin console under Orders and stock goes down.
4. Sign in as the administrator, change the order status, then cancel it and confirm stock is restored.
5. Open the site on a phone. The install popup appears; after installing, the app opens full screen and still loads offline.
6. Confirm the demo accounts do not exist (`customer@sleekshop.com` must be refused) if you seeded with `--catalogue-only`.

## Backups and operations

* Turso keeps point in time restore on paid plans. For any plan, export regularly: `turso db shell sleek-shop .dump > backup.sql`.
* Rotate the database token with `turso db tokens create` and update Render when needed.
* Render free services sleep when idle; the first request after a pause is slow. Use a paid instance for a live shop.
