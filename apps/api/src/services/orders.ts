import { defaultSettings, type Order, type OrderItem, type OrderStatus, type PaymentMethod, type Settings } from '@sleek/shared';
import { db } from '../db/client.js';
import { mapItem, mapOrder } from '../db/mappers.js';
import { HttpError } from '../lib/http.js';

export async function getSettings(): Promise<Settings> {
  const result = await db.execute({ sql: "SELECT value FROM settings WHERE key = 'store'", args: [] });
  const row = result.rows[0];
  return row ? { ...defaultSettings, ...JSON.parse(String(row.value)) } : defaultSettings;
}

export type NewOrder = { customerName: string; email: string; phone: string; address: string; city: string; notes?: string; payment: PaymentMethod; items: Array<{ productId: string; quantity: number }> };

/** Prices, stock and delivery fees are always calculated on the server. */
export async function createOrder(input: NewOrder, userId: string | null): Promise<Order> {
  const settings = await getSettings();
  const tx = await db.transaction('write');
  try {
    const merged = new Map<string, number>();
    input.items.forEach((item) => merged.set(item.productId, (merged.get(item.productId) ?? 0) + item.quantity));
    const items: OrderItem[] = [];
    for (const [productId, quantity] of merged) {
      const found = await tx.execute({ sql: 'SELECT id, name, price, stock, image, image_fallback, active FROM products WHERE id = ?', args: [productId] });
      const row = found.rows[0];
      if (!row || !row.active) throw new HttpError(409, 'One of the items in your bag is no longer available.');
      if (quantity > Number(row.stock)) throw new HttpError(409, `Only ${Number(row.stock)} of ${String(row.name)} left in stock.`);
      items.push({ productId, name: String(row.name), price: Number(row.price), quantity, image: String(row.image ?? ''), imageFallback: row.image_fallback ? String(row.image_fallback) : undefined });
    }
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingFee;
    const last = await tx.execute({ sql: "SELECT COALESCE(MAX(CAST(SUBSTR(id, 4) AS INTEGER)), 10000) AS n FROM orders", args: [] });
    const id = `SS-${Number(last.rows[0]?.n ?? 10000) + 1}`;
    const now = new Date().toISOString();
    await tx.execute({
      sql: `INSERT INTO orders (id, user_id, customer_name, email, phone, address, city, notes, subtotal, shipping, total, status, payment, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?, ?)`,
      args: [id, userId, input.customerName, input.email, input.phone, input.address, input.city, input.notes ?? null, subtotal, shipping, subtotal + shipping, input.payment, now, now],
    });
    for (const item of items) {
      const update = await tx.execute({ sql: 'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?', args: [item.quantity, item.productId, item.quantity] });
      if (update.rowsAffected !== 1) throw new HttpError(409, `Stock changed for ${item.name}. Please review your bag.`);
      await tx.execute({ sql: 'INSERT INTO order_items (order_id, product_id, name, price, quantity, image, image_fallback) VALUES (?, ?, ?, ?, ?, ?, ?)', args: [id, item.productId, item.name, item.price, item.quantity, item.image, item.imageFallback ?? null] });
    }
    await tx.commit();
    return { id, userId, customerName: input.customerName, email: input.email, phone: input.phone, address: input.address, city: input.city, notes: input.notes, items, subtotal, shipping, total: subtotal + shipping, status: 'Pending', payment: input.payment, createdAt: now, updatedAt: now };
  } catch (error) {
    await tx.rollback();
    throw error;
  } finally {
    tx.close();
  }
}

/** Changes the status and returns or removes stock when an order is cancelled or reinstated. */
export async function setOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  const tx = await db.transaction('write');
  try {
    const found = await tx.execute({ sql: 'SELECT status FROM orders WHERE id = ?', args: [orderId] });
    const row = found.rows[0];
    if (!row) throw new HttpError(404, 'Order not found.');
    const previous = String(row.status);
    if (previous !== status) {
      const direction = status === 'Cancelled' ? 1 : previous === 'Cancelled' ? -1 : 0;
      if (direction !== 0) {
        const lines = await tx.execute({ sql: 'SELECT product_id, quantity FROM order_items WHERE order_id = ?', args: [orderId] });
        for (const line of lines.rows) {
          await tx.execute({ sql: 'UPDATE products SET stock = MAX(0, stock + ?) WHERE id = ?', args: [direction * Number(line.quantity), String(line.product_id)] });
        }
      }
      await tx.execute({ sql: 'UPDATE orders SET status = ?, updated_at = ? WHERE id = ?', args: [status, new Date().toISOString(), orderId] });
    }
    await tx.commit();
  } catch (error) {
    await tx.rollback();
    throw error;
  } finally {
    tx.close();
  }
}

export async function listOrders(filter: { userId?: string; email?: string } = {}): Promise<Order[]> {
  const where = filter.userId ? 'WHERE user_id = ? OR (user_id IS NULL AND lower(email) = lower(?))' : '';
  const args = filter.userId ? [filter.userId, filter.email ?? ''] : [];
  const orders = await db.execute({ sql: `SELECT * FROM orders ${where} ORDER BY created_at DESC`, args });
  if (!orders.rows.length) return [];
  const itemRows = await db.execute({ sql: `SELECT * FROM order_items WHERE order_id IN (SELECT id FROM orders ${where}) ORDER BY id`, args });
  const byOrder = new Map<string, OrderItem[]>();
  for (const row of itemRows.rows) {
    const key = String(row.order_id);
    byOrder.set(key, [...(byOrder.get(key) ?? []), mapItem(row)]);
  }
  return orders.rows.map((row) => mapOrder(row, byOrder.get(String(row.id)) ?? []));
}
