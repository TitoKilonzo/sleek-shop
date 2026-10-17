import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const dir = mkdtempSync(join(tmpdir(), 'sleek-api-'));
process.env.TURSO_DATABASE_URL = `file:${join(dir, 'test.db')}`;
process.env.WEB_ORIGIN = 'http://localhost:5173';
process.env.DEMO_PASSWORD = 'Sleekshop@123';

let server: Server;
let base = '';

async function call(path: string, init: { method?: string; token?: string; body?: unknown } = {}) {
  const response = await fetch(`${base}/api/v1${path}`, {
    method: init.method ?? 'GET',
    headers: { 'Content-Type': 'application/json', ...(init.token ? { Authorization: `Bearer ${init.token}` } : {}) },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  return { status: response.status, body: (await response.json().catch(() => ({}))) as any };
}

beforeAll(async () => {
  const { seedDatabase } = await import('../src/db/seeder.js');
  await seedDatabase({ demoPassword: 'Sleekshop@123' });
  const { app } = await import('../src/app.js');
  await new Promise<void>((resolve) => { server = app.listen(0, resolve); });
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
afterAll(() => { server?.close(); rmSync(dir, { recursive: true, force: true }); });

describe('Sleek Shop API', () => {
  it('serves only active products to visitors and hides private data', async () => {
    const { status, body } = await call('/bootstrap');
    expect(status).toBe(200);
    expect(body.data.products.length).toBe(12);
    expect(body.data.orders).toEqual([]);
    expect(body.data.users).toEqual([]);
    expect(JSON.stringify(body)).not.toContain('scrypt$');
  });

  it('rejects wrong passwords and accepts the demo administrator', async () => {
    expect((await call('/auth/login', { method: 'POST', body: { email: 'admin@sleekshop.com', password: 'nope' } })).status).toBe(401);
    const ok = await call('/auth/login', { method: 'POST', body: { email: 'Admin@sleekshop.com', password: 'Sleekshop@123' } });
    expect(ok.status).toBe(200);
    expect(ok.body.data.user.role).toBe('admin');
    expect(ok.body.data.user.hash).toBe('');
  });

  it('protects staff routes from customers and visitors', async () => {
    const customer = await call('/auth/login', { method: 'POST', body: { email: 'customer@sleekshop.com', password: 'Sleekshop@123' } });
    const token = customer.body.data.token as string;
    expect((await call('/orders/SS-10412/status', { method: 'PATCH', body: { status: 'Shipped' } })).status).toBe(401);
    expect((await call('/orders/SS-10412/status', { method: 'PATCH', token, body: { status: 'Shipped' } })).status).toBe(403);
    const mine = await call('/bootstrap', { token });
    expect(mine.body.data.orders.every((o: { email: string }) => o.email === 'customer@sleekshop.com')).toBe(true);
    expect(mine.body.data.messages).toEqual([]);
  });

  it('places an order with server side pricing, reduces stock and restocks on cancel', async () => {
    const before = (await call('/bootstrap')).body.data.products.find((p: { id: string }) => p.id === 'p-006');
    const placed = await call('/orders', { method: 'POST', body: { customerName: 'Test Buyer', email: 'buyer@example.com', phone: '+254700111222', address: 'Riverside Drive', city: 'Nairobi', payment: 'M-Pesa on delivery', items: [{ productId: 'p-006', quantity: 2 }] } });
    expect(placed.status).toBe(201);
    expect(placed.body.data.subtotal).toBe(2 * before.price);
    expect(placed.body.data.shipping).toBe(350);
    expect(placed.body.data.id).toBe('SS-10413');
    const mid = (await call('/bootstrap')).body.data.products.find((p: { id: string }) => p.id === 'p-006');
    expect(mid.stock).toBe(before.stock - 2);

    const admin = (await call('/auth/login', { method: 'POST', body: { email: 'admin@sleekshop.com', password: 'Sleekshop@123' } })).body.data.token as string;
    expect((await call('/orders/SS-10413/status', { method: 'PATCH', token: admin, body: { status: 'Cancelled' } })).status).toBe(200);
    const after = (await call('/bootstrap')).body.data.products.find((p: { id: string }) => p.id === 'p-006');
    expect(after.stock).toBe(before.stock);
  });

  it('refuses orders that exceed stock', async () => {
    const result = await call('/orders', { method: 'POST', body: { customerName: 'Test Buyer', email: 'buyer@example.com', phone: '+254700111222', address: 'Riverside Drive', city: 'Nairobi', payment: 'Cash on delivery', items: [{ productId: 'p-005', quantity: 20 }] } });
    expect(result.status).toBe(409);
  });

  it('lets administrators manage products and settings', async () => {
    const admin = (await call('/auth/login', { method: 'POST', body: { email: 'admin@sleekshop.com', password: 'Sleekshop@123' } })).body.data.token as string;
    const created = await call('/products', { method: 'POST', token: admin, body: { name: 'Test Cap', brand: 'Sleek Edit', category: 'Accessories', sku: 'SS-ACC-099', description: 'A simple cap for everyday wear.', price: 1200, stock: 8, featured: false, active: true, image: '' } });
    expect(created.status).toBe(201);
    const list = (await call('/bootstrap', { token: admin })).body.data.products;
    expect(list.some((p: { name: string }) => p.name === 'Test Cap')).toBe(true);
    expect((await call(`/products/${created.body.data.id}`, { method: 'DELETE', token: admin })).status).toBe(200);
    const bad = await call('/settings', { method: 'PUT', token: admin, body: { storeName: '' } });
    expect(bad.status).toBe(400);
  });
});
