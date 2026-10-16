# Deployment notes

## Vercel (web)

Recommended monorepo configuration:

- Root directory: repository root
- Install command: `npm install`
- Build command: `npm run build -w @sleek/web`
- Output directory: `apps/web/dist`
- Environment variable: `VITE_API_URL=https://<render-api-domain>`

Depending on the project import settings, Vercel may permit `apps/web` as the root directory while still resolving workspace packages. If it does not, use repository root with the commands above.

## Render (API)

- Root directory: repository root
- Build command: `npm install && npm run build -w @sleek/api`
- Start command: `npm run start -w @sleek/api`
- Health check: `/api/health`
- Environment: `NODE_ENV=production`, `WEB_ORIGIN=https://<frontend-domain>`, Turso URL and token.

The process binds to `0.0.0.0` and reads Render's `PORT`. For multiple frontend origins, use a comma-separated exact allowlist in `WEB_ORIGIN`.

## Smoke test after deployment

1. `GET /api/health` returns `status: ok` and `database: turso`.
2. `GET /api/ready` returns `status: ready`.
3. `GET /api/v1/products?limit=4` returns product data.
4. Search and category filtering work from the storefront.
5. A test COD order stores one order and order items, decrements stock transactionally, and returns the expected total.
6. Confirm there are no secrets in browser bundles or public Vercel environment variables.
