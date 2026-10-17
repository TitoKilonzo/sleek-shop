export type Role = 'admin' | 'manager' | 'customer';
export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
export type PaymentMethod = 'Cash on delivery' | 'M-Pesa on delivery';

export type Product = {
  id: string;
  sku: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  rating: number;
  reviewCount: number;
  /** Primary image path or URL. */
  image: string;
  /** Used automatically if the primary image cannot be loaded. */
  imageFallback?: string;
  stock: number;
  featured: boolean;
  active: boolean;
  badge?: string;
  createdAt: string;
};

export type Category = { name: string; slug: string; subtitle: string; image: string; imageFallback: string };

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  /** Hash of the sign in credentials. Empty means the record cannot sign in. */
  hash: string;
  address: string;
  city: string;
  active: boolean;
  createdAt: string;
};

export type OrderItem = { productId: string; name: string; price: number; quantity: number; image: string; imageFallback?: string };

export type Order = {
  id: string;
  userId: string | null;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  payment: PaymentMethod;
  createdAt: string;
  updatedAt: string;
};

export type Message = { id: string; name: string; email: string; subject: string; body: string; read: boolean; createdAt: string };
export type Subscriber = { email: string; createdAt: string };

export type Settings = {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  address: string;
  hours: string;
  shippingFee: number;
  freeShippingThreshold: number;
  lowStockLevel: number;
  announcement: string;
};

export const ORDER_STATUSES: OrderStatus[] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
export const PAYMENT_METHODS: PaymentMethod[] = ['Cash on delivery', 'M-Pesa on delivery'];
