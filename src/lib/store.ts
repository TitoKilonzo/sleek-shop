import { useSyncExternalStore } from 'react';

const PREFIX = 'sleekshop.v2.';
const memory = new Map<string, string>();

function read(key: string): string | null {
  try { return localStorage.getItem(PREFIX + key); } catch { return memory.get(key) ?? null; }
}
function write(key: string, value: string) {
  try { localStorage.setItem(PREFIX + key, value); } catch { memory.set(key, value); }
}
function remove(key: string) {
  try { localStorage.removeItem(PREFIX + key); } catch { memory.delete(key); }
}

export type Store<T> = {
  get: () => T;
  set: (next: T | ((previous: T) => T)) => void;
  reset: () => void;
  subscribe: (listener: () => void) => () => void;
};

const registry: Array<Store<unknown>> = [];

/** A tiny persisted store. Works with localStorage, falls back to memory, syncs across tabs. */
export function createStore<T>(key: string, seed: () => T, options: { persistSeed?: boolean; resettable?: boolean; persist?: boolean } = {}): Store<T> {
  const { persistSeed = true, resettable = true, persist = true } = options;
  let value: T | undefined;
  let loaded = false;
  const listeners = new Set<() => void>();

  const load = () => {
    if (loaded) return;
    loaded = true;
    const raw = persist ? read(key) : null;
    if (raw !== null) {
      try { value = JSON.parse(raw) as T; return; } catch { /* fall through to the seed */ }
    }
    value = seed();
    if (persist && persistSeed) write(key, JSON.stringify(value));
  };
  const emit = () => listeners.forEach((listener) => listener());

  const store: Store<T> = {
    get() { load(); return value as T; },
    set(next) {
      load();
      value = typeof next === 'function' ? (next as (previous: T) => T)(value as T) : next;
      if (persist) write(key, JSON.stringify(value));
      emit();
    },
    reset() { if (persist) remove(key); loaded = false; value = undefined; load(); emit(); },
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
      if (persist && event.key === PREFIX + key) { loaded = false; value = undefined; emit(); }
    });
  }
  if (resettable) registry.push(store as Store<unknown>);
  return store;
}

export function useStore<T>(store: Store<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}

/** Restores every store (products, orders, customers, settings, messages and so on) to the built in demo data. */
export function resetAllStores() {
  registry.forEach((store) => store.reset());
}
