import './lib/loadEnv.js';
import { readFile } from 'node:fs/promises';
import { createClient } from '@libsql/client';
import { categories, demoProducts } from './data/products.js';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!url || !authToken) {
  console.error('Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN before running the seed script.');
  process.exit(1);
}
const client = createClient({ url, authToken });
const schema = await readFile(new URL('../../../database/schema.sql', import.meta.url), 'utf8');
await client.executeMultiple(schema);
for (const category of categories) {
  await client.execute({ sql: 'INSERT OR IGNORE INTO categories (id, name, slug, subtitle, image_url) VALUES (?, ?, ?, ?, ?)', args: [category.slug, category.name, category.slug, category.subtitle, category.imageUrl] });
}
for (const product of demoProducts) {
  await client.execute({
    sql: 'INSERT OR IGNORE INTO products (id, slug, name, brand, category, description, price, compare_at_price, rating, review_count, image_url, stock, featured, badge) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    args: [product.id, product.slug, product.name, product.brand, product.category, product.description, product.price, product.compareAtPrice ?? null, product.rating, product.reviewCount, product.imageUrl, product.stock, Number(product.featured), product.badge ?? null]
  });
}
await client.close();
console.log(`Seeded schema, ${categories.length} categories and ${demoProducts.length} products.`);
