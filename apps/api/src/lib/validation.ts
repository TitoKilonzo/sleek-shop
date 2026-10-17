import { z } from 'zod';

const text = (min: number, max: number) => z.string().trim().min(min).max(max);
const email = z.string().trim().toLowerCase().email().max(254);

export const loginSchema = z.object({ email, password: z.string().min(1).max(200) }).strict();
export const registerSchema = z.object({ name: text(2, 100), email, phone: text(7, 24), password: z.string().min(8).max(200) }).strict();
export const profileSchema = z.object({ name: text(2, 100).optional(), phone: text(7, 24).optional(), address: z.string().trim().max(250).optional(), city: z.string().trim().max(80).optional() }).strict();
export const passwordSchema = z.object({ current: z.string().min(1).max(200), next: z.string().min(8).max(200) }).strict();

export const productSchema = z.object({
  name: text(2, 140), brand: text(1, 80), category: text(1, 60), sku: text(2, 40), description: text(10, 2000),
  price: z.number().int().min(1).max(100_000_000), compareAtPrice: z.number().int().min(1).max(100_000_000).optional(),
  stock: z.number().int().min(0).max(1_000_000), badge: z.string().trim().max(20).optional(),
  featured: z.boolean(), active: z.boolean(), image: z.string().max(700_000).default(''), imageFallback: z.string().max(1000).optional(),
}).strict().refine((value) => !value.compareAtPrice || value.compareAtPrice > value.price, { message: 'Compare at price must be higher than the price.', path: ['compareAtPrice'] });

export const orderSchema = z.object({
  customerName: text(2, 100), email, phone: text(7, 24), address: text(5, 250), city: text(2, 80),
  notes: z.string().trim().max(500).optional(),
  payment: z.enum(['Cash on delivery', 'M-Pesa on delivery']),
  items: z.array(z.object({ productId: text(1, 80), quantity: z.number().int().min(1).max(20) }).strict()).min(1).max(30),
}).strict();

export const statusSchema = z.object({ status: z.enum(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']) }).strict();
export const activeSchema = z.object({ active: z.boolean() }).strict();
export const messageSchema = z.object({ name: text(2, 100), email, subject: text(3, 120), body: text(10, 2000) }).strict();
export const subscribeSchema = z.object({ email }).strict();
export const settingsSchema = z.object({
  storeName: text(1, 80), supportEmail: email, supportPhone: text(5, 40), address: text(2, 200), hours: text(2, 120), announcement: text(1, 160),
  shippingFee: z.number().int().min(0).max(1_000_000), freeShippingThreshold: z.number().int().min(0).max(100_000_000), lowStockLevel: z.number().int().min(0).max(100_000),
}).strict();
