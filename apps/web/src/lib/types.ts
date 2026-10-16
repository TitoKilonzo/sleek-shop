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

export type Category = { name: string; slug: string; subtitle: string; imageUrl: string };
export type ApiResponse<T> = { data: T; pagination?: { total: number; limit: number; offset: number } };
