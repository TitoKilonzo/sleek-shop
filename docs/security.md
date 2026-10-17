# Security notes

## Implemented

* Passwords are hashed with scrypt and a random salt. Plain passwords are never stored or logged.
* Sessions use random 256 bit tokens. Only a SHA 256 digest is stored in the database. Sessions expire (default 7 days),
  are removed on sign out and are revoked when an account is deactivated.
* Role checks on every protected route (customer, manager, administrator). Customers only ever receive their own orders.
* Request validation with zod (strict schemas, size limits). Parameterised SQL only.
* Prices, delivery fees and stock are calculated on the server and orders are written in one transaction.
* Helmet headers, exact origin CORS allow list, JSON size limit, global and per route rate limits (stricter for sign in and orders).
* Generic error responses. Request bodies, tokens and customer details are never logged.
* Secrets stay on the server. The only public setting is `VITE_API_URL`.

## Demo accounts

Demo mode and `npm run db:seed` create accounts with a documented password. Never use them in production:
seed production with `npm run db:seed -- --catalogue-only` and create your own administrator with `npm run admin:create`.
In demo mode credentials exist only as hashes inside the browser bundle and offer no real protection, which is acceptable
because the demo data is also local to the visitor.

## Before taking real payments or a large audience

* Add online payments with provider signature verification and idempotent order creation (M-Pesa Daraja or a card gateway).
  Today orders are pay on delivery and no payment is processed online.
* Add password reset by email, email verification and optional two step sign in for staff.
* Move the session token to an `HttpOnly` cookie on a shared parent domain if you want to remove token handling from JavaScript,
  and add CSRF protection when you do.
* Add shared rate limiting (for example Redis) if you run more than one API instance.
* Set up dependency and secret scanning, monitoring, backups and a data retention policy.
