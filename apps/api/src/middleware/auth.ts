import type { NextFunction, Request, Response } from 'express';
import type { Role } from '@sleek/shared';
import { db } from '../db/client.js';
import { tokenDigest } from '../lib/security.js';

export type AuthUser = { id: string; name: string; email: string; role: Role };

declare module 'express-serve-static-core' {
  interface Request { user?: AuthUser }
}

/** Reads the bearer token, if any, and attaches the signed in user. Never rejects. */
export async function attachUser(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.header('authorization') ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
    if (token) {
      const result = await db.execute({
        sql: `SELECT u.id, u.name, u.email, u.role FROM sessions s JOIN users u ON u.id = s.user_id
              WHERE s.token_hash = ? AND s.expires_at > ? AND u.active = 1 LIMIT 1`,
        args: [tokenDigest(token), new Date().toISOString()],
      });
      const row = result.rows[0];
      if (row) req.user = { id: String(row.id), name: String(row.name), email: String(row.email), role: String(row.role) as Role };
    }
    next();
  } catch (error) { next(error); }
}

export const requireUser = (req: Request, res: Response, next: NextFunction) => (req.user ? next() : void res.status(401).json({ error: 'Please sign in to continue.' }));
export const requireStaff = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return void res.status(401).json({ error: 'Please sign in to continue.' });
  if (req.user.role === 'customer') return void res.status(403).json({ error: 'You do not have permission to do this.' });
  next();
};
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return void res.status(401).json({ error: 'Please sign in to continue.' });
  if (req.user.role !== 'admin') return void res.status(403).json({ error: 'Only an administrator can do this.' });
  next();
};
