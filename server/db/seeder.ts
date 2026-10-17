import { defaultSettings, seedMessages, seedOrders, seedProducts, seedSubscribers, seedUsers } from '../../shared/index.js';
import { hashPassword } from '../lib/security.js';
import { db, migrate } from './client.js';

export type SeedOptions = { force?: boolean; catalogueOnly?: boolean; demoPassword?: string };

/** Loads demo data. Returns a message describing what happened. */
export async function seedDatabase({ force = false, catalogueOnly = false, demoPassword = 'Sleekshop@123' }: SeedOptions = {}): Promise<string> {
  await migrate();
  const existing = Number((await db.execute('SELECT count(*) AS n FROM products')).rows[0]?.n ?? 0);
  if (existing > 0 && !force) return `Database already has ${existing} products. Use --force to wipe and reload.`;
  if (force) {
    for (const table of ['sessions', 'order_items', 'orders', 'messages', 'subscribers', 'products', 'users', 'settings']) await db.execute(`DELETE FROM ${table}`);
  }
  const statements: Array<{ sql: string; args: Array<string | number | null> }> = [];
  for (const p of seedProducts()) {
    statements.push({
      sql: `INSERT INTO products (id, sku, slug, name, brand, category, description, price, compare_at_price, rating, review_count, image, image_fallback, stock, featured, active, badge, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [p.id, p.sku, p.slug, p.name, p.brand, p.category, p.description, p.price, p.compareAtPrice ?? null, p.rating, p.reviewCount, p.image, p.imageFallback ?? null, p.stock, Number(p.featured), Number(p.active), p.badge ?? null, p.createdAt],
    });
  }
  statements.push({ sql: "INSERT INTO settings (key, value) VALUES ('store', ?)", args: [JSON.stringify(defaultSettings)] });

  if (!catalogueOnly) {
    const passwordHash = await hashPassword(demoPassword);
    for (const u of seedUsers()) {
      statements.push({
        sql: 'INSERT INTO users (id, name, email, phone, role, password_hash, address, city, active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        args: [u.id, u.name, u.email, u.phone, u.role, u.hash ? passwordHash : '', u.address, u.city, Number(u.active), u.createdAt],
      });
    }
    for (const o of seedOrders()) {
      statements.push({
        sql: 'INSERT INTO orders (id, user_id, customer_name, email, phone, address, city, notes, subtotal, shipping, total, status, payment, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        args: [o.id, o.userId, o.customerName, o.email, o.phone, o.address, o.city, o.notes ?? null, o.subtotal, o.shipping, o.total, o.status, o.payment, o.createdAt, o.updatedAt],
      });
      for (const i of o.items) {
        statements.push({ sql: 'INSERT INTO order_items (order_id, product_id, name, price, quantity, image, image_fallback) VALUES (?, ?, ?, ?, ?, ?, ?)', args: [o.id, i.productId, i.name, i.price, i.quantity, i.image, i.imageFallback ?? null] });
      }
    }
    for (const m of seedMessages()) statements.push({ sql: 'INSERT INTO messages (id, name, email, subject, body, read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)', args: [m.id, m.name, m.email, m.subject, m.body, Number(m.read), m.createdAt] });
    for (const s of seedSubscribers()) statements.push({ sql: 'INSERT INTO subscribers (email, created_at) VALUES (?, ?)', args: [s.email, s.createdAt] });
  }


  await db.batch(statements, 'write');
  return catalogueOnly ? 'Seeded the product catalogue and settings.' : 'Seeded the product catalogue, demo accounts, orders, messages and settings.';
}
