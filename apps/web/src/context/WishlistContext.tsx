import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Product } from '../lib/types';

type WishlistValue = { ids: string[]; count: number; isSaved: (productId: string) => boolean; toggleSaved: (product: Product) => boolean };
const WishlistContext = createContext<WishlistValue | null>(null);
const STORAGE_KEY = 'sleek-shop-wishlist-v1';
function loadSaved(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : [];
  } catch { return []; }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>(loadSaved);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)); } catch { /* Saved items remain available in memory for this session. */ } }, [ids]);
  const isSaved = useCallback((productId: string) => ids.includes(productId), [ids]);
  const toggleSaved = useCallback((product: Product) => {
    const removing = ids.includes(product.id);
    setIds((current) => removing ? current.filter((id) => id !== product.id) : [...current, product.id]);
    return !removing;
  }, [ids]);
  const value = useMemo(() => ({ ids, count: ids.length, isSaved, toggleSaved }), [ids, isSaved, toggleSaved]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const value = useContext(WishlistContext);
  if (!value) throw new Error('useWishlist must be used inside WishlistProvider');
  return value;
}
