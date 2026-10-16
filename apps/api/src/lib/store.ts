import './loadEnv.js';
import { createClient, type Client } from '@libsql/client';
import { demoProducts, type Product } from '../data/products.js';

const databaseUrl = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
export const databaseMode: 'turso' | 'demo' = databaseUrl && authToken ? 'turso' : 'demo';
let client: Client | null = null;
if (databaseMode === 'turso') {
  client = createClient({ url: databaseUrl!, authToken: authToken! });
}

export type ProductQuery = {
  search?: string;
  category?: string;
  sort?: 'featured' | 'price-asc' | 'price-desc' | 'rating';
  limit: number;
  offset: number;
};

function sortProducts(products: Product[], sort: ProductQuery['sort']): Product[] {
  const items = [...products];
  if (sort === 'price-asc') return items.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') return items.sort((a, b) => b.price - a.price);
  if (sort === 'rating') return items.sort((a, b) => b.rating - a.rating);
  return items.sort((a, b) => Number(b.featured) - Number(a.featured));
}

export async function listProducts(query: ProductQuery): Promise<{ items: Product[]; total: number }> {
  if (!client) {
    let items = demoProducts.filter((product) => product.stock > 0);
    if (query.search) {
      const needle = query.search.trim().toLowerCase();
      items = items.filter((product) => [product.name, product.brand, product.category, product.description].some((value) => value.toLowerCase().includes(needle)));
    }
    if (query.category) items = items.filter((product) => product.category.toLowerCase() === query.category!.toLowerCase());
    const total = items.length;
    items = sortProducts(items, query.sort).slice(query.offset, query.offset + query.limit);
    return { items, total };
  }

  const where: string[] = ["status = 'active'", 'stock > 0'];
  const args: (string | number)[] = [];
  if (query.search) {
    where.push('(lower(name) LIKE ? OR lower(brand) LIKE ? OR lower(category) LIKE ? OR lower(description) LIKE ?)');
    const term = `%${query.search.trim().toLowerCase()}%`;
    args.push(term, term, term, term);
  }
  if (query.category) {
    where.push('lower(category) = ?');
    args.push(query.category.toLowerCase());
  }
  const whereSql = `WHERE ${where.join(' AND ')}`;
  const sortSql = query.sort === 'price-asc' ? 'price ASC' : query.sort === 'price-desc' ? 'price DESC' : query.sort === 'rating' ? 'rating DESC' : 'featured DESC, id ASC';
  const [itemsResult, countResult] = await Promise.all([
    client.execute({ sql: `SELECT id, slug, name, brand, category, description, price, compare_at_price, rating, review_count, image_url, stock, featured, badge FROM products ${whereSql} ORDER BY ${sortSql} LIMIT ? OFFSET ?`, args: [...args, query.limit, query.offset] }),
    client.execute({ sql: `SELECT count(*) AS total FROM products ${whereSql}`, args })
  ]);
  const items = itemsResult.rows.map((row) => ({
    id: String(row.id), slug: String(row.slug), name: String(row.name), brand: String(row.brand), category: String(row.category), description: String(row.description),
    price: Number(row.price), compareAtPrice: row.compare_at_price == null ? undefined : Number(row.compare_at_price), rating: Number(row.rating), reviewCount: Number(row.review_count),
    imageUrl: String(row.image_url), stock: Number(row.stock), featured: Boolean(row.featured), badge: row.badge == null ? undefined : String(row.badge)
  } satisfies Product));
  return { items, total: Number(countResult.rows[0]?.total ?? 0) };
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  if (!client) return demoProducts.find((product) => product.slug === slug);
  const result = await client.execute({ sql: "SELECT id, slug, name, brand, category, description, price, compare_at_price, rating, review_count, image_url, stock, featured, badge FROM products WHERE slug = ? AND status = 'active' LIMIT 1", args: [slug] });
  const row = result.rows[0];
  if (!row) return undefined;
  return {
    id: String(row.id), slug: String(row.slug), name: String(row.name), brand: String(row.brand), category: String(row.category), description: String(row.description),
    price: Number(row.price), compareAtPrice: row.compare_at_price == null ? undefined : Number(row.compare_at_price), rating: Number(row.rating), reviewCount: Number(row.review_count),
    imageUrl: String(row.image_url), stock: Number(row.stock), featured: Boolean(row.featured), badge: row.badge == null ? undefined : String(row.badge)
  };
}

export type OrderInput = {
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;
  items: Array<{ productId: string; quantity: number }>;
};

export async function createOrder(input: OrderInput): Promise<{ orderId: string; total: number; status: string }> {
  const orderId = `SLK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  if (!client) {
    let total = 0;
    for (const item of input.items) {
      const product = demoProducts.find((entry) => entry.id === item.productId);
      if (!product || product.stock < item.quantity) throw new Error(`Insufficient stock for ${product?.name ?? 'one of your items'}.`);
      total += product.price * item.quantity;
    }
    const deliveryFee = total >= 7500 ? 0 : 350;
    return { orderId, total: total + deliveryFee, status: 'awaiting_confirmation' };
  }

  const tx = await client.transaction('write');
  try {
    let total = 0;
    const resolved: Array<{ product: Product; quantity: number }> = [];
    for (const item of input.items) {
      const result = await tx.execute({ sql: "SELECT id, slug, name, brand, category, description, price, compare_at_price, rating, review_count, image_url, stock, featured, badge FROM products WHERE id = ? AND status = 'active' LIMIT 1", args: [item.productId] });
      const row = result.rows[0];
      if (!row) throw new Error('One of the products is no longer available.');
      const product: Product = { id: String(row.id), slug: String(row.slug), name: String(row.name), brand: String(row.brand), category: String(row.category), description: String(row.description), price: Number(row.price), compareAtPrice: row.compare_at_price == null ? undefined : Number(row.compare_at_price), rating: Number(row.rating), reviewCount: Number(row.review_count), imageUrl: String(row.image_url), stock: Number(row.stock), featured: Boolean(row.featured), badge: row.badge == null ? undefined : String(row.badge) };
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > product.stock) throw new Error(`Insufficient stock for ${product.name}.`);
      total += product.price * item.quantity;
      resolved.push({ product, quantity: item.quantity });
    }
    const deliveryFee = total >= 7500 ? 0 : 350;
    const orderTotal = total + deliveryFee;
    await tx.execute({ sql: 'INSERT INTO orders (id, customer_name, email, phone, address, city, notes, subtotal, delivery_fee, total, status, payment_method, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', args: [orderId, input.customerName, input.email, input.phone, input.address, input.city, input.notes ?? '', total, deliveryFee, orderTotal, 'awaiting_confirmation', 'cash_on_delivery', new Date().toISOString()] });
    for (const { product, quantity } of resolved) {
      const update = await tx.execute({ sql: 'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?', args: [quantity, product.id, quantity] });
      if (update.rowsAffected !== 1) throw new Error(`Stock changed for ${product.name}. Please review your cart.`);
      await tx.execute({ sql: 'INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity) VALUES (?, ?, ?, ?, ?)', args: [orderId, product.id, product.name, product.price, quantity] });
    }
    await tx.commit();
    return { orderId, total: orderTotal, status: 'awaiting_confirmation' };
  } catch (error) {
    await tx.rollback();
    throw error;
  }
}

export async function pingDatabase(): Promise<boolean> {
  if (!client) return true;
  await client.execute('SELECT 1');
  return true;
}
