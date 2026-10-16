import './lib/loadEnv.js';
import express, { type ErrorRequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { productsRouter } from './routes/products.js';
import { ordersRouter } from './routes/orders.js';
import { databaseMode, pingDatabase } from './lib/store.js';

export const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());
const allowedOrigins = (process.env.WEB_ORIGIN ?? 'http://localhost:5173').split(',').map((origin) => origin.trim()).filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS.'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key']
}));
app.use(express.json({ limit: '100kb' }));
app.use(rateLimit({
  windowMs: Number(process.env.API_RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000),
  limit: Number(process.env.API_RATE_LIMIT_MAX ?? 300),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again shortly.' }
}));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'Sleek Shop API', timestamp: new Date().toISOString(), database: databaseMode }));
app.get('/api/ready', async (_req, res) => {
  try {
    await pingDatabase();
    return res.json({ status: 'ready' });
  } catch {
    return res.status(503).json({ status: 'not_ready' });
  }
});
app.use('/api/v1', productsRouter);
app.use('/api/v1/orders', ordersRouter);
app.use('/api', (_req, res) => res.status(404).json({ error: 'API route not found.' }));

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error?.message === 'Origin is not allowed by CORS.') return res.status(403).json({ error: 'Origin is not allowed.' });
  // Log a request-safe summary; never log request bodies, tokens or customer details here.
  console.error('[api-error]', { name: error?.name ?? 'Error', message: error?.message ?? 'Unexpected error' });
  return res.status(500).json({ error: 'An unexpected server error occurred.' });
};
app.use(errorHandler);
