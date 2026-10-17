import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { defaultSettings } from '@sleek/shared';
import { config } from '../config.js';
import { db } from '../db/client.js';
import { mapMessage, mapProduct, mapSubscriber, mapUser } from '../db/mappers.js';
import { HttpError, handler, parse } from '../lib/http.js';
import { hashPassword, newId, newToken, slugify, tokenDigest, verifyPassword } from '../lib/security.js';
import { activeSchema, loginSchema, messageSchema, orderSchema, passwordSchema, productSchema, profileSchema, registerSchema, settingsSchema, statusSchema, subscribeSchema } from '../lib/validation.js';
import { attachUser, requireAdmin, requireStaff, requireUser } from '../middleware/auth.js';
import { createOrder, getSettings, listOrders, setOrderStatus } from '../services/orders.js';

export const api = Router();
const limiter = (max: number, message: string) => rateLimit({ windowMs: config.rateLimit.windowMs, limit: max, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: message } });
const loginLimiter = limiter(config.rateLimit.loginMax, 'Too many sign in attempts. Please wait a few minutes and try again.');
const orderLimiter = limiter(config.rateLimit.orderMax, 'Too many order attempts. Please wait before trying again.');
const publicWriteLimiter = limiter(config.rateLimit.orderMax, 'Too many requests. Please wait before trying again.');

api.use(attachUser);

async function startSession(userId: string) {
  const token = newToken();
  const now = new Date();
  const expires = new Date(now.getTime() + config.sessionDays * 86_400_000);
  await db.execute({ sql: 'INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)', args: [tokenDigest(token), userId, now.toISOString(), expires.toISOString()] });
  await db.execute({ sql: 'DELETE FROM sessions WHERE expires_at < ?', args: [now.toISOString()] });
  return token;
}

/* One call returns everything the signed in role is allowed to see. */
api.get('/bootstrap', handler(async (req, res) => {
  const user = req.user;
  const staff = user && user.role !== 'customer';
  const [products, settings] = await Promise.all([
    db.execute({ sql: `SELECT * FROM products ${staff ? '' : 'WHERE active = 1'} ORDER BY created_at DESC`, args: [] }),
    getSettings(),
  ]);
  const body: Record<string, unknown> = { products: products.rows.map(mapProduct), settings, user: null, users: [], orders: [], messages: [], subscribers: [] };
  if (user) {
    const [users, orders] = await Promise.all([
      staff ? db.execute({ sql: 'SELECT * FROM users ORDER BY created_at', args: [] }) : db.execute({ sql: 'SELECT * FROM users WHERE id = ?', args: [user.id] }),
      staff ? listOrders() : listOrders({ userId: user.id, email: user.email }),
    ]);
    const mappedUsers = users.rows.map(mapUser);
    body.users = mappedUsers;
    body.user = mappedUsers.find((item) => item.id === user.id) ?? null;
    body.orders = orders;
    if (staff) {
      const [messages, subscribers] = await Promise.all([
        db.execute({ sql: 'SELECT * FROM messages ORDER BY created_at DESC', args: [] }),
        db.execute({ sql: 'SELECT * FROM subscribers ORDER BY created_at DESC', args: [] }),
      ]);
      body.messages = messages.rows.map(mapMessage);
      body.subscribers = subscribers.rows.map(mapSubscriber);
    }
  }
  res.json({ data: body });
}));

/* Authentication */
api.post('/auth/login', loginLimiter, handler(async (req, res) => {
  const { email, password } = parse(loginSchema, req.body);
  const found = await db.execute({ sql: 'SELECT * FROM users WHERE email = ? LIMIT 1', args: [email] });
  const row = found.rows[0];
  const valid = row && row.password_hash ? await verifyPassword(password, String(row.password_hash)) : false;
  if (!row || !valid) throw new HttpError(401, 'The email address or password is incorrect.');
  if (!row.active) throw new HttpError(403, 'This account has been deactivated. Please contact support.');
  res.json({ data: { token: await startSession(String(row.id)), user: mapUser(row) } });
}));

api.post('/auth/register', loginLimiter, handler(async (req, res) => {
  const input = parse(registerSchema, req.body);
  const exists = await db.execute({ sql: 'SELECT 1 FROM users WHERE email = ?', args: [input.email] });
  if (exists.rows.length) throw new HttpError(409, 'An account with this email address already exists.');
  const id = newId('u');
  await db.execute({
    sql: "INSERT INTO users (id, name, email, phone, role, password_hash, address, city, active, created_at) VALUES (?, ?, ?, ?, 'customer', ?, '', '', 1, ?)",
    args: [id, input.name, input.email, input.phone, await hashPassword(input.password), new Date().toISOString()],
  });
  const created = await db.execute({ sql: 'SELECT * FROM users WHERE id = ?', args: [id] });
  res.status(201).json({ data: { token: await startSession(id), user: mapUser(created.rows[0]!) } });
}));

api.post('/auth/logout', requireUser, handler(async (req, res) => {
  const token = (req.header('authorization') ?? '').slice(7).trim();
  await db.execute({ sql: 'DELETE FROM sessions WHERE token_hash = ?', args: [tokenDigest(token)] });
  res.json({ data: { ok: true } });
}));

api.patch('/auth/profile', requireUser, handler(async (req, res) => {
  const patch = parse(profileSchema, req.body);
  const sets = Object.entries({ name: patch.name, phone: patch.phone, address: patch.address, city: patch.city }).filter(([, value]) => value !== undefined);
  if (sets.length) await db.execute({ sql: `UPDATE users SET ${sets.map(([key]) => `${key} = ?`).join(', ')} WHERE id = ?`, args: [...sets.map(([, value]) => value as string), req.user!.id] });
  res.json({ data: { ok: true } });
}));

api.post('/auth/password', requireUser, loginLimiter, handler(async (req, res) => {
  const { current, next } = parse(passwordSchema, req.body);
  const found = await db.execute({ sql: 'SELECT password_hash FROM users WHERE id = ?', args: [req.user!.id] });
  if (!(await verifyPassword(current, String(found.rows[0]?.password_hash ?? '')))) throw new HttpError(400, 'Your current password is incorrect.');
  await db.execute({ sql: 'UPDATE users SET password_hash = ? WHERE id = ?', args: [await hashPassword(next), req.user!.id] });
  res.json({ data: { ok: true } });
}));

/* Products */
async function uniqueSlug(name: string, ignoreId?: string) {
  const base = slugify(name) || 'product';
  let slug = base;
  for (let n = 2; ; n += 1) {
    const found = await db.execute({ sql: 'SELECT id FROM products WHERE slug = ?', args: [slug] });
    if (!found.rows.length || String(found.rows[0]!.id) === ignoreId) return slug;
    slug = `${base}-${n}`;
  }
}

api.post('/products', requireStaff, handler(async (req, res) => {
  const p = parse(productSchema, req.body);
  const sku = await db.execute({ sql: 'SELECT 1 FROM products WHERE sku = ?', args: [p.sku] });
  if (sku.rows.length) throw new HttpError(409, 'Another product already uses this SKU.');
  const id = newId('p');
  await db.execute({
    sql: `INSERT INTO products (id, sku, slug, name, brand, category, description, price, compare_at_price, rating, review_count, image, image_fallback, stock, featured, active, badge, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 4.5, 0, ?, ?, ?, ?, ?, ?, ?)`,
    args: [id, p.sku, await uniqueSlug(p.name), p.name, p.brand, p.category, p.description, p.price, p.compareAtPrice ?? null, p.image, p.imageFallback ?? null, p.stock, Number(p.featured), Number(p.active), p.badge ?? null, new Date().toISOString()],
  });
  res.status(201).json({ data: { id } });
}));

api.put('/products/:id', requireStaff, handler(async (req, res) => {
  const p = parse(productSchema, req.body);
  const id = String(req.params.id);
  const clash = await db.execute({ sql: 'SELECT id FROM products WHERE sku = ? AND id <> ?', args: [p.sku, id] });
  if (clash.rows.length) throw new HttpError(409, 'Another product already uses this SKU.');
  const result = await db.execute({
    sql: `UPDATE products SET sku = ?, name = ?, brand = ?, category = ?, description = ?, price = ?, compare_at_price = ?, image = ?, image_fallback = ?, stock = ?, featured = ?, active = ?, badge = ? WHERE id = ?`,
    args: [p.sku, p.name, p.brand, p.category, p.description, p.price, p.compareAtPrice ?? null, p.image, p.imageFallback ?? null, p.stock, Number(p.featured), Number(p.active), p.badge ?? null, id],
  });
  if (!result.rowsAffected) throw new HttpError(404, 'Product not found.');
  res.json({ data: { id } });
}));

api.patch('/products/:id/active', requireStaff, handler(async (req, res) => {
  const { active } = parse(activeSchema, req.body);
  const result = await db.execute({ sql: 'UPDATE products SET active = ? WHERE id = ?', args: [Number(active), String(req.params.id)] });
  if (!result.rowsAffected) throw new HttpError(404, 'Product not found.');
  res.json({ data: { ok: true } });
}));

api.delete('/products/:id', requireAdmin, handler(async (req, res) => {
  await db.execute({ sql: 'DELETE FROM products WHERE id = ?', args: [String(req.params.id)] });
  res.json({ data: { ok: true } });
}));

/* Orders */
api.post('/orders', orderLimiter, handler(async (req, res) => {
  const input = parse(orderSchema, req.body);
  const order = await createOrder(input, req.user?.id ?? null);
  res.status(201).json({ data: order });
}));

api.patch('/orders/:id/status', requireStaff, handler(async (req, res) => {
  const { status } = parse(statusSchema, req.body);
  await setOrderStatus(String(req.params.id), status);
  res.json({ data: { ok: true } });
}));

/* Customers */
api.patch('/users/:id/active', requireAdmin, handler(async (req, res) => {
  const { active } = parse(activeSchema, req.body);
  const id = String(req.params.id);
  if (id === req.user!.id) throw new HttpError(400, 'You cannot deactivate your own account.');
  const result = await db.execute({ sql: "UPDATE users SET active = ? WHERE id = ? AND role = 'customer'", args: [Number(active), id] });
  if (!result.rowsAffected) throw new HttpError(404, 'Customer not found.');
  if (!active) await db.execute({ sql: 'DELETE FROM sessions WHERE user_id = ?', args: [id] });
  res.json({ data: { ok: true } });
}));

/* Messages and newsletter */
api.post('/messages', publicWriteLimiter, handler(async (req, res) => {
  const m = parse(messageSchema, req.body);
  await db.execute({ sql: 'INSERT INTO messages (id, name, email, subject, body, read, created_at) VALUES (?, ?, ?, ?, ?, 0, ?)', args: [newId('m'), m.name, m.email, m.subject, m.body, new Date().toISOString()] });
  res.status(201).json({ data: { ok: true } });
}));
api.patch('/messages/:id/read', requireStaff, handler(async (req, res) => {
  await db.execute({ sql: 'UPDATE messages SET read = 1 WHERE id = ?', args: [String(req.params.id)] });
  res.json({ data: { ok: true } });
}));
api.delete('/messages/:id', requireStaff, handler(async (req, res) => {
  await db.execute({ sql: 'DELETE FROM messages WHERE id = ?', args: [String(req.params.id)] });
  res.json({ data: { ok: true } });
}));
api.post('/subscribers', publicWriteLimiter, handler(async (req, res) => {
  const { email } = parse(subscribeSchema, req.body);
  const result = await db.execute({ sql: 'INSERT OR IGNORE INTO subscribers (email, created_at) VALUES (?, ?)', args: [email, new Date().toISOString()] });
  res.status(201).json({ data: { added: result.rowsAffected > 0 } });
}));
api.delete('/subscribers/:email', requireStaff, handler(async (req, res) => {
  await db.execute({ sql: 'DELETE FROM subscribers WHERE email = ?', args: [String(req.params.email)] });
  res.json({ data: { ok: true } });
}));

/* Settings */
api.put('/settings', requireAdmin, handler(async (req, res) => {
  const settings = parse(settingsSchema, req.body);
  await db.execute({ sql: "INSERT INTO settings (key, value) VALUES ('store', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value", args: [JSON.stringify({ ...defaultSettings, ...settings })] });
  res.json({ data: settings });
}));
