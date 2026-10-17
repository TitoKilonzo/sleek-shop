import dotenv from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Reads .env from the project root when it exists (hosting platforms inject variables directly).
const envFile = resolve(process.cwd(), '.env');
if (existsSync(envFile)) dotenv.config({ path: envFile, override: false });

const env = process.env;
const production = env.NODE_ENV === 'production';

export const config = {
  production,
  port: Number(env.PORT ?? 4000),
  /** Extra browser origins allowed to call the API. Needed only when the web app is hosted on a different address. */
  webOrigins: (env.WEB_ORIGIN ?? '').split(',').map((value) => value.trim()).filter(Boolean),
  /** Turso: libsql://your-db.turso.io. For local work a file URL such as file:./data/sleek.db also works. */
  databaseUrl: env.TURSO_DATABASE_URL || 'file:./data/sleek.db',
  databaseToken: env.TURSO_AUTH_TOKEN || undefined,
  sessionDays: Number(env.SESSION_DAYS ?? 7),
  rateLimit: {
    windowMs: Number(env.API_RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000),
    max: Number(env.API_RATE_LIMIT_MAX ?? 600),
    loginMax: Number(env.LOGIN_RATE_LIMIT_MAX ?? 20),
    orderMax: Number(env.ORDER_RATE_LIMIT_MAX ?? 30),
  },
};

export const usingLocalFile = config.databaseUrl.startsWith('file:');
