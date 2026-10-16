import { describe, expect, it } from 'vitest';
import { demoProducts } from '../data/products.js';

describe('demo catalogue', () => {
  it('contains unique product slugs and non-negative prices', () => {
    const slugs = demoProducts.map((product) => product.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(demoProducts.every((product) => product.price >= 0)).toBe(true);
    expect(demoProducts.every((product) => product.stock >= 0)).toBe(true);
  });

  it('includes products across the launch categories', () => {
    expect(new Set(demoProducts.map((product) => product.category))).toEqual(
      new Set(['Bags', 'Footwear', 'Tech', 'Laptops', 'Accessories'])
    );
  });
});
