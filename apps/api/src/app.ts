import compression from 'compression';
import cors from 'cors';
import express, { type ErrorRequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { config } from './config.js';
import { db } from './db/client.js';
import { HttpError } from './lib/http.js';
import { api } from './routes/index.js';

export const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());
app.use(cors({
  origin(origin, callback) {
    if (!origin || config.webOrigins.includes(origin)) return callback(null, true);
    return callback(new HttpError(403, 'Origin is not allowed.'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit({ windowMs: config.rateLimit.windowMs, limit: config.rateLimit.max, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: 'Too many requests. Please try again shortly.' } }));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'Sleek Shop API', database: 'turso', timestamp: new Date().toISOString() }));
app.get('/api/ready', async (_req, res) => {
  try { await db.execute('SELECT 1'); res.json({ status: 'ready' }); } catch { res.status(503).json({ status: 'not_ready' }); }
});
app.use('/api/v1', api);
app.use('/api', (_req, res) => res.status(404).json({ error: 'API route not found.' }));

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof HttpError) return res.status(error.status).json({ error: error.message });
  if (error?.type === 'entity.too.large') return res.status(413).json({ error: 'The request is too large.' });
  if (error?.type === 'entity.parse.failed') return res.status(400).json({ error: 'The request body is not valid JSON.' });
  // Log a request safe summary. Never log bodies, tokens or customer details.
  console.error('[api-error]', { name: error?.name ?? 'Error', message: error?.message ?? 'Unexpected error' });
  return res.status(500).json({ error: 'An unexpected server error occurred.' });
};
app.use(errorHandler);
