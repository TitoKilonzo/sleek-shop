export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  stock: number;
  featured: boolean;
  badge?: string;
};

export const demoProducts: Product[] = [
  { id: 'p-001', slug: 'everyday-structured-tote', name: 'Everyday Structured Tote', brand: 'Sleek Edit', category: 'Bags', description: 'A clean-lined, roomy everyday tote with a softly structured silhouette, considered details and space for everything you need.', price: 3490, compareAtPrice: 4200, rating: 4.8, reviewCount: 128, imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=85', stock: 18, featured: true, badge: 'Bestseller' },
  { id: 'p-002', slug: 'everyday-runner-sneaker', name: 'Everyday Runner Sneakers', brand: 'Northline', category: 'Footwear', description: 'Lightweight everyday sneakers with a cushioned sole and versatile profile, built for errands, commutes and weekend plans.', price: 5890, compareAtPrice: 6990, rating: 4.7, reviewCount: 96, imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85', stock: 24, featured: true, badge: 'Popular' },
  { id: 'p-003', slug: 'studio-wireless-headphones', name: 'Studio Wireless Headphones', brand: 'Aural', category: 'Tech', description: 'Comfortable over-ear headphones for focused listening, calls and daily travel, with a minimal design that fits into your routine.', price: 7490, rating: 4.6, reviewCount: 74, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85', stock: 11, featured: true, badge: 'New arrival' },
  { id: 'p-004', slug: 'minimal-classic-watch', name: 'Minimal Classic Watch', brand: 'Form & Time', category: 'Accessories', description: 'A timeless everyday watch with a pared-back dial, a balanced case and a versatile strap for work or weekends.', price: 4250, rating: 4.5, reviewCount: 53, imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85', stock: 16, featured: true },
  { id: 'p-005', slug: 'everyday-laptop-15', name: 'Everyday Laptop 15', brand: 'Aster', category: 'Laptops', description: 'A practical laptop for study, remote work and everyday productivity. Confirm the listed configuration and warranty details before purchase.', price: 68900, compareAtPrice: 72900, rating: 4.4, reviewCount: 31, imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=85', stock: 5, featured: true, badge: 'Limited stock' },
  { id: 'p-006', slug: 'urban-daypack', name: 'Urban Daypack', brand: 'Northline', category: 'Bags', description: 'A streamlined daypack with a practical shape for commuting, campus days and short trips.', price: 2990, rating: 4.7, reviewCount: 62, imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85', stock: 22, featured: true },
  { id: 'p-007', slug: 'everyday-sunglasses', name: 'Everyday Sunglasses', brand: 'Sol Studio', category: 'Accessories', description: 'A wearable frame with a modern silhouette for bright days and easy styling. Check product specifications for lens details.', price: 1890, rating: 4.3, reviewCount: 45, imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=85', stock: 30, featured: false },
  { id: 'p-008', slug: 'soft-touch-laptop-sleeve', name: 'Soft-Touch Laptop Sleeve', brand: 'Sleek Edit', category: 'Tech', description: 'A padded sleeve designed to help protect your laptop in a bag or while moving between home, work and class.', price: 1590, rating: 4.6, reviewCount: 82, imageUrl: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=900&q=85', stock: 27, featured: false },
  { id: 'p-009', slug: 'weekend-crossbody', name: 'Weekend Crossbody Bag', brand: 'Sleek Edit', category: 'Bags', description: 'A compact crossbody bag for essentials, with an easy-to-style finish for day plans and evenings out.', price: 2490, rating: 4.8, reviewCount: 67, imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=85', stock: 14, featured: false },
  { id: 'p-010', slug: 'court-classic-trainers', name: 'Court Classic Trainers', brand: 'Northline', category: 'Footwear', description: 'Minimal low-profile trainers that pair easily with everyday outfits, designed for versatile casual wear.', price: 4590, rating: 4.5, reviewCount: 38, imageUrl: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=900&q=85', stock: 19, featured: false },
  { id: 'p-011', slug: 'wireless-precision-mouse', name: 'Wireless Precision Mouse', brand: 'Aural', category: 'Tech', description: 'A compact wireless mouse for everyday productivity with a clean profile for desk setups and mobile work.', price: 2190, rating: 4.4, reviewCount: 29, imageUrl: 'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=900&q=85', stock: 25, featured: false },
  { id: 'p-012', slug: 'daily-carry-wallet', name: 'Daily Carry Wallet', brand: 'Form & Time', category: 'Accessories', description: 'A compact wallet for daily cards and essentials, designed to slip neatly into a pocket or small bag.', price: 1290, rating: 4.6, reviewCount: 42, imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=85', stock: 33, featured: false }
];

export const categories = [
  { name: 'Bags', slug: 'bags', subtitle: 'Carry it beautifully', imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=720&q=85' },
  { name: 'Footwear', slug: 'footwear', subtitle: 'Step into your style', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=720&q=85' },
  { name: 'Tech', slug: 'tech', subtitle: 'Smarter everyday gear', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=720&q=85' },
  { name: 'Laptops', slug: 'laptops', subtitle: 'Work, study, create', imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=720&q=85' },
  { name: 'Accessories', slug: 'accessories', subtitle: 'The finishing touch', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=720&q=85' }
];
