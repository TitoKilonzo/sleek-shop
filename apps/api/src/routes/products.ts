import { Router } from 'express';
import { z } from 'zod';
import { categories } from '../data/products.js';
import { getProductBySlug, listProducts } from '../lib/store.js';

export const productsRouter = Router();
const querySchema = z.object({
  search: z.string().trim().max(100).optional(),
  category: z.string().trim().max(40).optional(),
  sort: z.enum(['featured', 'price-asc', 'price-desc', 'rating']).default('featured'),
  limit: z.coerce.number().int().min(1).max(48).default(12),
  offset: z.coerce.number().int().min(0).max(10000).default(0)
});

productsRouter.get('/categories', (_req, res) => res.json({ data: categories }));
productsRouter.get('/products', async (req, res, next) => {
  try {
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid product query.', details: parsed.error.flatten() });
    const result = await listProducts(parsed.data);
    res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=120');
    return res.json({ data: result.items, pagination: { total: result.total, limit: parsed.data.limit, offset: parsed.data.offset } });
  } catch (error) { return next(error); }
});
productsRouter.get('/products/:slug', async (req, res, next) => {
  try {
    const product = await getProductBySlug(req.params.slug);
    if (!product) return res.status(404).json({ error: 'Product not found.' });
    res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=120');
    return res.json({ data: product });
  } catch (error) { return next(error); }
});
