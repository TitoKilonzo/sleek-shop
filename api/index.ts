import type { IncomingMessage, ServerResponse } from 'node:http';
import { app } from '../server/app.js';
import { migrate } from '../server/db/client.js';

/**
 * Vercel serverless entry point. Every request to /api/* is routed here (see vercel.json).
 * The database tables are created on the first request of each cold start, then reused.
 */
let ready: Promise<void> | undefined;

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    ready ??= migrate();
    await ready;
  } catch (error) {
    ready = undefined;
    console.error('[api] database unavailable', (error as Error).message);
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'The database is not reachable. Check the Turso settings.' }));
    return;
  }
  return app(req, res);
}
