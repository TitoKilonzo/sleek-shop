# Sleek Shop architecture

## Runtime topology

```text
Browser / installed PWA
  ├─ Vercel CDN and static frontend
  └─ HTTPS requests ──> Render Node.js API
                           ├─ Helmet / CORS / compression / rate limit
                           ├─ Zod request validation
                           ├─ Catalogue and order modules
                           └─ Store adapter
                                 ├─ Demo repository (local development only)
                                 └─ Turso / libSQL (production persistence)

Product media: dedicated media/CDN URLs (currently Unsplash sample URLs)
```

## Architecture approach

Start as a modular monolith. Product browsing, product details and categories share the catalogue module. Checkout and order creation live in a distinct order module. Payment integrations, seller operations, delivery orchestration and background jobs should be independent modules/interfaces before deployment-level separation is considered.

Keep business-critical decisions on the server: price, availability, order total, delivery fee, user permissions and payment state. The browser is a presentation and interaction layer, not the authority for commercial state.

## Scaling principles

1. Serve immutable frontend assets and versioned images through CDNs.
2. Measure API p50/p95/p99 latency, error rate, DB query latency, database write contention and checkout failure rate.
3. Tune query shapes and indexes before adding shared cache infrastructure.
4. Keep API instances stateless; store sessions and shared rate-limit state outside an instance when auth/scaling is introduced.
5. Add a durable queue for retryable notifications and external provider events when the workflow needs it.
6. Use idempotency and transactions for checkout, stock updates and payment events.
7. Load-test a mix of browse/search traffic, checkout bursts, duplicate callbacks and simultaneous purchases of the final unit.

## Cache boundaries

Public category/product data can use short CDN cache-control windows and revalidation. Keep carts, personal account responses, addresses, seller dashboards, checkout and order data private and non-shareable. Even when the displayed stock is cached, checkout must check current stock inside a transaction. Cache invalidation should be triggered for product status, price, images and other public catalogue updates.

## API error contract

Expected validation errors return HTTP 400 with a stable human-readable error plus structured validation details. Missing products return 404. Stock conflicts return 409. Unexpected failures return a generic HTTP 500 response while server logs receive a request-safe summary.
