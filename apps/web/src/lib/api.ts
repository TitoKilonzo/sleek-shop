import type { ApiResponse, Category, Product } from './types';

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || 'http://localhost:4000';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error ?? `Request failed (${response.status}).`);
  return body as T;
}

export async function getProducts(options: { search?: string; category?: string; sort?: string; limit?: number } = {}) {
  const params = new URLSearchParams();
  if (options.search) params.set('search', options.search);
  if (options.category) params.set('category', options.category);
  if (options.sort) params.set('sort', options.sort);
  params.set('limit', String(options.limit ?? 24));
  const response = await request<ApiResponse<Product[]>>(`/api/v1/products?${params.toString()}`);
  return response.data;
}

export async function getProduct(slug: string) {
  const response = await request<ApiResponse<Product>>(`/api/v1/products/${encodeURIComponent(slug)}`);
  return response.data;
}

export async function getCategories() {
  const response = await request<ApiResponse<Category[]>>('/api/v1/categories');
  return response.data;
}

export type CheckoutPayload = {
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;
  items: Array<{ productId: string; quantity: number }>;
};

export async function submitOrder(payload: CheckoutPayload) {
  const response = await request<ApiResponse<{ orderId: string; total: number; status: string; paymentMethod: string; message: string }>>('/api/v1/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return response.data;
}

export const apiBaseUrl = API_URL;
