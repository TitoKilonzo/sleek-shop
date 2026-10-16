import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { createOrder } from '../lib/store.js';

export const ordersRouter = Router();
const orderCreationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.ORDER_RATE_LIMIT_MAX ?? 20),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many order attempts. Please wait before trying again.' }
});
const orderSchema = z.object({
  customerName: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(7).max(24),
  address: z.string().trim().min(5).max(250),
  city: z.string().trim().min(2).max(80),
  notes: z.string().trim().max(500).optional(),
  items: z.array(z.object({ productId: z.string().min(1).max(80), quantity: z.number().int().min(1).max(20) })).min(1).max(30).superRefine((items, ctx) => {
    const seen = new Set<string>();
    items.forEach((item, index) => {
      if (seen.has(item.productId)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: [index, 'productId'], message: 'Each product can appear only once.' });
      seen.add(item.productId);
    });
  })
}).strict();

ordersRouter.post('/', orderCreationLimiter, async (req, res, next) => {
  try {
    const parsed = orderSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Please check your checkout details.', details: parsed.error.flatten() });
    const result = await createOrder(parsed.data);
    return res.status(201).json({ data: { ...result, paymentMethod: 'cash_on_delivery', message: 'Order received. Our team will contact you to confirm delivery.' } });
  } catch (error) {
    if (error instanceof Error && /stock|available/i.test(error.message)) return res.status(409).json({ error: error.message });
    return next(error);
  }
});
