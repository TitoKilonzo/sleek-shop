import type { Row } from '@libsql/client';
import type { Message, Order, OrderItem, Product, Subscriber, User } from '../../shared/index.js';

const text = (value: unknown) => (value == null ? '' : String(value));
const optional = (value: unknown) => (value == null || value === '' ? undefined : String(value));

export const mapProduct = (row: Row): Product => ({
  id: text(row.id), sku: text(row.sku), slug: text(row.slug), name: text(row.name), brand: text(row.brand), category: text(row.category),
  description: text(row.description), price: Number(row.price), compareAtPrice: row.compare_at_price == null ? undefined : Number(row.compare_at_price),
  rating: Number(row.rating), reviewCount: Number(row.review_count), image: text(row.image), imageFallback: optional(row.image_fallback),
  stock: Number(row.stock), featured: Boolean(row.featured), active: Boolean(row.active), badge: optional(row.badge), createdAt: text(row.created_at),
});

/** Public user shape. The password hash is never included. */
export const mapUser = (row: Row): User => ({
  id: text(row.id), name: text(row.name), email: text(row.email), phone: text(row.phone), role: text(row.role) as User['role'], hash: '',
  address: text(row.address), city: text(row.city), active: Boolean(row.active), createdAt: text(row.created_at),
});

export const mapItem = (row: Row): OrderItem => ({
  productId: text(row.product_id), name: text(row.name), price: Number(row.price), quantity: Number(row.quantity), image: text(row.image), imageFallback: optional(row.image_fallback),
});

export const mapOrder = (row: Row, items: OrderItem[]): Order => ({
  id: text(row.id), userId: row.user_id == null ? null : text(row.user_id), customerName: text(row.customer_name), email: text(row.email), phone: text(row.phone),
  address: text(row.address), city: text(row.city), notes: optional(row.notes), items, subtotal: Number(row.subtotal), shipping: Number(row.shipping), total: Number(row.total),
  status: text(row.status) as Order['status'], payment: text(row.payment) as Order['payment'], createdAt: text(row.created_at), updatedAt: text(row.updated_at),
});

export const mapMessage = (row: Row): Message => ({
  id: text(row.id), name: text(row.name), email: text(row.email), subject: text(row.subject), body: text(row.body), read: Boolean(row.read), createdAt: text(row.created_at),
});

export const mapSubscriber = (row: Row): Subscriber => ({ email: text(row.email), createdAt: text(row.created_at) });
