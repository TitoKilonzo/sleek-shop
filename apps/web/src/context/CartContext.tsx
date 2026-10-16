import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Product } from '../lib/types';

export type CartLine = { product: Product; quantity: number };
type CartContextValue = {
  items: CartLine[];
  itemCount: number;
  subtotal: number;
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};
const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'sleek-shop-cart-v1';

function loadCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    return Array.isArray(parsed) ? parsed.filter((line) => line?.product?.id && Number.isInteger(line.quantity) && line.quantity > 0) : [];
  } catch { return []; }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>(loadCart);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* Cart still works for this session when storage is unavailable. */ } }, [items]);

  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems((current) => {
      const found = current.find((line) => line.product.id === product.id);
      if (found) return current.map((line) => line.product.id === product.id ? { ...line, product, quantity: Math.min(product.stock, line.quantity + quantity) } : line);
      return [...current, { product, quantity: Math.min(product.stock, Math.max(1, quantity)) }];
    });
  }, []);
  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) { setItems((current) => current.filter((line) => line.product.id !== productId)); return; }
    setItems((current) => current.map((line) => line.product.id === productId ? { ...line, quantity: Math.min(line.product.stock, quantity) } : line));
  }, []);
  const removeItem = useCallback((productId: string) => setItems((current) => current.filter((line) => line.product.id !== productId)), []);
  const clearCart = useCallback(() => setItems([]), []);
  const value = useMemo(() => ({ items, itemCount: items.reduce((total, line) => total + line.quantity, 0), subtotal: items.reduce((total, line) => total + line.product.price * line.quantity, 0), addItem, updateQuantity, removeItem, clearCart }), [items, addItem, updateQuantity, removeItem, clearCart]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error('useCart must be used inside CartProvider');
  return value;
}
