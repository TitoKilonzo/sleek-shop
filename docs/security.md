# Security baseline and remaining work

## In the starter

- Helmet security headers and disabled `X-Powered-By` header.
- Exact-origin CORS allow list configured by `WEB_ORIGIN`.
- JSON body-size limit and API rate limit.
- Zod validation for catalogue query and checkout payloads.
- Parameterized SQL statements.
- Server-side product price lookup and transactional stock decrement in Turso mode.
- Secrets remain server-side; frontend config is intentionally limited to `VITE_API_URL`.
- Generic internal-error response rather than returning stack traces or request bodies.

## Required before commercial production

- Secure account authentication, authorization middleware and per-resource ownership checks.
- Secure `HttpOnly`, `Secure`, `SameSite` cookies plus CSRF defenses where cookie authentication is used.
- Login/reset throttling, multifactor authentication for privileged users and session revocation.
- Order-level idempotency and payment provider signature/timestamp verification.
- Strict seller-tenant isolation and audit logs for privileged actions.
- Production rate limiting backed by shared infrastructure if multiple API instances are used.
- Dependency scanning, secret scanning, security review, load tests and a vulnerability reporting/incident process.
- Data retention/deletion rules, privacy notices and tested backup recovery.

Do not claim PCI compliance, payment verification or authentication is implemented by this starter. Online payments and account authentication are intentionally not wired yet.
