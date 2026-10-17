import images from './images.json';
import type { Category, Product } from './types';

type ImageEntry = { key: string; file: string; url: string };
const entries = images as ImageEntry[];

/** Local file first (served from /images), original source only as a safety net. */
export function photo(key: string): { src: string; fallback: string } {
  const entry = entries.find((item) => item.key === key);
  if (!entry) return { src: '', fallback: '' };
  return { src: `/images/${entry.file}`, fallback: entry.url };
}

const stamp = (daysAgo: number) => new Date(Date.UTC(2026, 8, 1) - daysAgo * 86400000).toISOString();

type Seed = Omit<Product, 'image' | 'imageFallback' | 'createdAt' | 'active'> & { photo: string; age: number };

const seeds: Seed[] = [
  { id: 'p-001', sku: 'SS-BAG-001', slug: 'everyday-structured-tote', name: 'Everyday Structured Tote', brand: 'Sleek Edit', category: 'Bags', description: 'A roomy tote with a clean, softly structured shape. It holds a laptop, a notebook and your daily essentials without losing its form.', price: 3490, compareAtPrice: 4200, rating: 4.8, reviewCount: 128, stock: 18, featured: true, badge: 'Bestseller', photo: 'tote', age: 120 },
  { id: 'p-002', sku: 'SS-FTW-002', slug: 'everyday-runner-sneakers', name: 'Everyday Runner Sneakers', brand: 'Northline', category: 'Footwear', description: 'Lightweight sneakers with a cushioned sole and a versatile profile. Made for errands, commutes and weekend plans.', price: 5890, compareAtPrice: 6990, rating: 4.7, reviewCount: 96, stock: 24, featured: true, badge: 'Popular', photo: 'sneakers', age: 110 },
  { id: 'p-003', sku: 'SS-TEC-003', slug: 'studio-wireless-headphones', name: 'Studio Wireless Headphones', brand: 'Aural', category: 'Tech', description: 'Comfortable over-ear headphones for focused listening, calls and daily travel, in a minimal design that suits any routine.', price: 7490, rating: 4.6, reviewCount: 74, stock: 11, featured: true, badge: 'New arrival', photo: 'headphones', age: 12 },
  { id: 'p-004', sku: 'SS-ACC-004', slug: 'minimal-classic-watch', name: 'Minimal Classic Watch', brand: 'Form & Time', category: 'Accessories', description: 'A timeless everyday watch with a pared back dial, a balanced case and a versatile strap that works from office to weekend.', price: 4250, rating: 4.5, reviewCount: 53, stock: 16, featured: true, photo: 'watch', age: 95 },
  { id: 'p-005', sku: 'SS-LAP-005', slug: 'everyday-laptop-15', name: 'Everyday Laptop 15', brand: 'Aster', category: 'Laptops', description: 'A dependable 15 inch laptop for study, remote work and everyday productivity. Please confirm the listed configuration and warranty terms at checkout.', price: 68900, compareAtPrice: 72900, rating: 4.4, reviewCount: 31, stock: 5, featured: true, badge: 'Limited stock', photo: 'laptop', age: 60 },
  { id: 'p-006', sku: 'SS-BAG-006', slug: 'urban-daypack', name: 'Urban Daypack', brand: 'Northline', category: 'Bags', description: 'A streamlined daypack with a practical shape for commuting, campus days and short trips.', price: 2990, rating: 4.7, reviewCount: 62, stock: 22, featured: true, photo: 'daypack', age: 88 },
  { id: 'p-007', sku: 'SS-ACC-007', slug: 'everyday-sunglasses', name: 'Everyday Sunglasses', brand: 'Sol Studio', category: 'Accessories', description: 'A wearable frame with a modern silhouette for bright days and easy styling. Check the product label for lens details.', price: 1890, rating: 4.3, reviewCount: 45, stock: 30, featured: false, photo: 'sunglasses', age: 75 },
  { id: 'p-008', sku: 'SS-TEC-008', slug: 'soft-touch-laptop-sleeve', name: 'Soft-Touch Laptop Sleeve', brand: 'Sleek Edit', category: 'Tech', description: 'A padded sleeve that protects your laptop in a bag or while moving between home, work and class.', price: 1590, rating: 4.6, reviewCount: 82, stock: 27, featured: false, photo: 'sleeve', age: 70 },
  { id: 'p-009', sku: 'SS-BAG-009', slug: 'weekend-crossbody-bag', name: 'Weekend Crossbody Bag', brand: 'Sleek Edit', category: 'Bags', description: 'A compact crossbody bag for your essentials, with an easy finish for day plans and evenings out.', price: 2490, rating: 4.8, reviewCount: 67, stock: 14, featured: false, photo: 'crossbody', age: 40 },
  { id: 'p-010', sku: 'SS-FTW-010', slug: 'court-classic-trainers', name: 'Court Classic Trainers', brand: 'Northline', category: 'Footwear', description: 'Minimal low profile trainers that pair easily with everyday outfits and are comfortable for all day wear.', price: 4590, rating: 4.5, reviewCount: 38, stock: 19, featured: false, photo: 'trainers', age: 30 },
  { id: 'p-011', sku: 'SS-TEC-011', slug: 'wireless-precision-mouse', name: 'Wireless Precision Mouse', brand: 'Aural', category: 'Tech', description: 'A compact wireless mouse with a clean profile, suited to desk setups and mobile work.', price: 2190, rating: 4.4, reviewCount: 29, stock: 25, featured: false, photo: 'mouse', age: 22 },
  { id: 'p-012', sku: 'SS-ACC-012', slug: 'daily-carry-wallet', name: 'Daily Carry Wallet', brand: 'Form & Time', category: 'Accessories', description: 'A slim wallet for daily cards and cash that slips neatly into a pocket or a small bag.', price: 1290, rating: 4.6, reviewCount: 42, stock: 33, featured: false, photo: 'wallet', age: 8 },
];

export const seedProducts = (): Product[] => seeds.map(({ photo: key, age, ...rest }) => {
  const image = photo(key);
  return { ...rest, image: image.src, imageFallback: image.fallback, active: true, createdAt: stamp(age) };
});

const categoryMeta: Array<{ name: string; slug: string; subtitle: string; photo: string }> = [
  { name: 'Bags', slug: 'bags', subtitle: 'Totes, daypacks and crossbody styles', photo: 'tote' },
  { name: 'Footwear', slug: 'footwear', subtitle: 'Sneakers and trainers', photo: 'sneakers' },
  { name: 'Tech', slug: 'tech', subtitle: 'Audio, accessories and daily gear', photo: 'headphones' },
  { name: 'Laptops', slug: 'laptops', subtitle: 'For work, study and creating', photo: 'laptop' },
  { name: 'Accessories', slug: 'accessories', subtitle: 'Watches, eyewear and wallets', photo: 'watch' },
];

export const categories: Category[] = categoryMeta.map(({ photo: key, ...rest }) => {
  const image = photo(key);
  return { ...rest, image: image.src, imageFallback: image.fallback };
});

export const categoryNames = categories.map((category) => category.name);
