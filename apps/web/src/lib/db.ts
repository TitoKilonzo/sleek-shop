import { credentialHash, defaultSettings, seedMessages, seedOrders, seedProducts, seedSubscribers, seedUsers } from '@sleek/shared';
import { createStore, useStore } from './store';
import { clearToken, remoteMode, request, setToken, getToken } from './remote';
import type { Message, Order, OrderItem, OrderStatus, PaymentMethod, Product, Role, Settings, Subscriber, User } from '@sleek/shared';

/*
 * Data comes from one of two places:
 *  - Demo mode (no VITE_API_URL): hard coded demo data kept in this browser.
 *  - API mode (VITE_API_URL set): the Turso backed API. Products and settings are cached for offline use;
 *    private data (orders, customers, messages) is kept in memory only.
 */
const server = remoteMode;
export const productsStore = createStore<Product[]>('products', server ? () => [] : seedProducts);
export const ordersStore = createStore<Order[]>('orders', server ? () => [] : seedOrders, { persist: !server });
export const usersStore = createStore<User[]>('users', server ? () => [] : seedUsers, { persist: !server });
export const messagesStore = createStore<Message[]>('messages', server ? () => [] : seedMessages, { persist: !server });
export const subscribersStore = createStore<Subscriber[]>('subscribers', server ? () => [] : seedSubscribers, { persist: !server });
export const settingsStore = createStore<Settings>('settings', () => defaultSettings);
export const sessionStore = createStore<string | null>('session', () => null, { resettable: false, persist: !server });
export const lastOrderStore = createStore<Order | null>('last-order', () => null, { resettable: false, persist: false });
export const cartStore = createStore<Array<{ productId: string; quantity: number }>>('cart', () => [], { resettable: false });
export const wishlistStore = createStore<string[]>('wishlist', () => [], { resettable: false });

export const useProducts = () => useStore(productsStore);
export const useOrders = () => useStore(ordersStore);
export const useUsers = () => useStore(usersStore);
export const useMessages = () => useStore(messagesStore);
export const useSubscribers = () => useStore(subscribersStore);
export const useSettings = () => useStore(settingsStore);
export const useLastOrder = () => useStore(lastOrderStore);
export { remoteMode };

const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const now = () => new Date().toISOString();
export const money = (value: number) => `KES ${Math.round(value).toLocaleString('en-KE')}`;
export const shippingFor = (subtotal: number, settings: Settings) => (subtotal === 0 || subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingFee);
export const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

/* ---------- Server sync (API mode) ---------- */
type Bootstrap = { products: Product[]; settings: Settings; user: User | null; users: User[]; orders: Order[]; messages: Message[]; subscribers: Subscriber[] };

/** Loads everything the current visitor is allowed to see from the API into the local stores. */
export async function hydrate() {
  const data = await request<Bootstrap>('/bootstrap');
  if (!data.user && getToken()) clearToken();
  productsStore.set(data.products);
  settingsStore.set({ ...defaultSettings, ...data.settings });
  usersStore.set(data.users);
  ordersStore.set(data.orders);
  messagesStore.set(data.messages);
  subscribersStore.set(data.subscribers);
  sessionStore.set(data.user?.id ?? null);
}

const refresh = () => (remoteMode ? hydrate() : Promise.resolve());
const message = (error: unknown) => (error instanceof Error ? error.message : 'Something went wrong. Please try again.');

/* ---------- Authentication ---------- */
export const isStaff = (role?: Role) => role === 'admin' || role === 'manager';

export function useAuth() {
  const sessionId = useStore(sessionStore);
  const users = useUsers();
  const user = sessionId ? users.find((item) => item.id === sessionId && item.active) ?? null : null;
  return { user, isStaff: isStaff(user?.role), isAdmin: user?.role === 'admin' };
}

export type AuthResult = { ok: true; user: User } | { ok: false; error: string };

async function openSession(path: string, body: unknown): Promise<AuthResult> {
  try {
    const { token } = await request<{ token: string; user: User }>(path, { method: 'POST', body });
    setToken(token);
    await hydrate();
    const user = usersStore.get().find((item) => item.id === sessionStore.get());
    return user ? { ok: true, user } : { ok: false, error: 'Could not load your account. Please try again.' };
  } catch (error) { return { ok: false, error: message(error) }; }
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const address = email.trim().toLowerCase();
  if (!address || !password) return { ok: false, error: 'Enter your email address and password.' };
  if (remoteMode) return openSession('/auth/login', { email: address, password });
  const user = usersStore.get().find((item) => item.email.toLowerCase() === address);
  if (!user || !user.hash || user.hash !== credentialHash(address, password)) return { ok: false, error: 'The email address or password is incorrect.' };
  if (!user.active) return { ok: false, error: 'This account has been deactivated. Please contact support.' };
  sessionStore.set(user.id);
  return { ok: true, user };
}

export async function logout() {
  if (remoteMode) {
    try { await request('/auth/logout', { method: 'POST' }); } catch { /* the token is discarded either way */ }
    clearToken();
    sessionStore.set(null);
    try { await hydrate(); } catch { /* offline: private data is cleared below */ }
    usersStore.set([]); ordersStore.set([]); messagesStore.set([]); subscribersStore.set([]);
    return;
  }
  sessionStore.set(null);
}

export async function register(input: { name: string; email: string; phone: string; password: string }): Promise<AuthResult> {
  const email = input.email.trim().toLowerCase();
  if (input.name.trim().length < 2) return { ok: false, error: 'Please enter your full name.' };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { ok: false, error: 'Please enter a valid email address.' };
  if (input.password.length < 8) return { ok: false, error: 'Your password must be at least 8 characters.' };
  if (remoteMode) return openSession('/auth/register', { name: input.name.trim(), email, phone: input.phone.trim(), password: input.password });
  if (usersStore.get().some((item) => item.email.toLowerCase() === email)) return { ok: false, error: 'An account with this email address already exists.' };
  const user: User = { id: uid('u'), name: input.name.trim(), email, phone: input.phone.trim(), role: 'customer', hash: credentialHash(email, input.password), address: '', city: '', active: true, createdAt: now() };
  usersStore.set((current) => [...current, user]);
  sessionStore.set(user.id);
  return { ok: true, user };
}

export async function updateProfile(userId: string, patch: Partial<Pick<User, 'name' | 'phone' | 'address' | 'city'>>) {
  if (remoteMode) { await request('/auth/profile', { method: 'PATCH', body: patch }); await refresh(); return; }
  usersStore.set((current) => current.map((item) => (item.id === userId ? { ...item, ...patch } : item)));
}

export async function changePassword(userId: string, currentPassword: string, nextPassword: string): Promise<{ ok: boolean; error?: string }> {
  if (nextPassword.length < 8) return { ok: false, error: 'Your new password must be at least 8 characters.' };
  if (remoteMode) {
    try { await request('/auth/password', { method: 'POST', body: { current: currentPassword, next: nextPassword } }); return { ok: true }; } catch (error) { return { ok: false, error: message(error) }; }
  }
  const user = usersStore.get().find((item) => item.id === userId);
  if (!user) return { ok: false, error: 'Account not found.' };
  if (user.hash !== credentialHash(user.email, currentPassword)) return { ok: false, error: 'Your current password is incorrect.' };
  usersStore.set((current) => current.map((item) => (item.id === userId ? { ...item, hash: credentialHash(item.email, nextPassword) } : item)));
  return { ok: true };
}

export async function setUserActive(id: string, active: boolean) {
  if (remoteMode) { await request(`/users/${encodeURIComponent(id)}/active`, { method: 'PATCH', body: { active } }); await refresh(); return; }
  usersStore.set((current) => current.map((user) => (user.id === id ? { ...user, active } : user)));
}

/* ---------- Catalogue ---------- */
export type ProductQuery = { search?: string; category?: string; sort?: string };

export function queryProducts(products: Product[], { search = '', category = '', sort = 'featured' }: ProductQuery) {
  const term = search.trim().toLowerCase();
  const list = products.filter((product) => product.active
    && (!category || product.category.toLowerCase() === category.toLowerCase())
    && (!term || [product.name, product.brand, product.category, product.description].some((field) => field.toLowerCase().includes(term))));
  const sorted = [...list];
  if (sort === 'price-asc') sorted.sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') sorted.sort((a, b) => b.price - a.price);
  else if (sort === 'rating') sorted.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
  else sorted.sort((a, b) => Number(b.featured) - Number(a.featured) || b.reviewCount - a.reviewCount);
  return sorted;
}

export type ProductInput = Omit<Product, 'id' | 'slug' | 'createdAt' | 'rating' | 'reviewCount'> & { id?: string };

export async function saveProduct(input: ProductInput): Promise<void> {
  if (remoteMode) {
    const { id, ...body } = input;
    await request(id ? `/products/${encodeURIComponent(id)}` : '/products', { method: id ? 'PUT' : 'POST', body });
    await refresh();
    return;
  }
  const existing = input.id ? productsStore.get().find((item) => item.id === input.id) : undefined;
  if (productsStore.get().some((item) => item.sku.toLowerCase() === input.sku.toLowerCase() && item.id !== existing?.id)) throw new Error('Another product already uses this SKU.');
  const taken = new Set(productsStore.get().filter((item) => item.id !== existing?.id).map((item) => item.slug));
  let slug = existing?.slug ?? slugify(input.name);
  if (!existing) { const base = slug; let n = 2; while (taken.has(slug)) slug = `${base}-${n++}`; }
  const product: Product = { ...input, id: existing?.id ?? uid('p'), slug, rating: existing?.rating ?? 4.5, reviewCount: existing?.reviewCount ?? 0, createdAt: existing?.createdAt ?? now() };
  productsStore.set((current) => (existing ? current.map((item) => (item.id === product.id ? product : item)) : [product, ...current]));
}

export async function setProductActive(id: string, active: boolean) {
  if (remoteMode) { await request(`/products/${encodeURIComponent(id)}/active`, { method: 'PATCH', body: { active } }); await refresh(); return; }
  productsStore.set((current) => current.map((item) => (item.id === id ? { ...item, active } : item)));
}

export async function deleteProduct(id: string) {
  if (remoteMode) { await request(`/products/${encodeURIComponent(id)}`, { method: 'DELETE' }); await refresh(); return; }
  productsStore.set((current) => current.filter((item) => item.id !== id));
}

/* ---------- Cart and saved items ---------- */
export function useCart() {
  const lines = useStore(cartStore);
  const products = useProducts();
  const items = lines.flatMap((line) => {
    const product = products.find((item) => item.id === line.productId && item.active);
    return product ? [{ product, quantity: Math.max(1, Math.min(line.quantity, product.stock)) }] : [];
  }).filter((line) => line.product.stock > 0);
  return {
    items,
    itemCount: items.reduce((sum, line) => sum + line.quantity, 0),
    subtotal: items.reduce((sum, line) => sum + line.product.price * line.quantity, 0),
    addItem(product: Product, quantity = 1) {
      cartStore.set((current) => {
        const found = current.find((line) => line.productId === product.id);
        if (found) return current.map((line) => (line.productId === product.id ? { ...line, quantity: Math.min(product.stock, line.quantity + quantity) } : line));
        return [...current, { productId: product.id, quantity: Math.min(product.stock, Math.max(1, quantity)) }];
      });
    },
    updateQuantity(productId: string, quantity: number) {
      cartStore.set((current) => (quantity < 1 ? current.filter((line) => line.productId !== productId) : current.map((line) => (line.productId === productId ? { ...line, quantity } : line))));
    },
    removeItem(productId: string) { cartStore.set((current) => current.filter((line) => line.productId !== productId)); },
    clearCart() { cartStore.set([]); },
  };
}

export function useWishlist() {
  const ids = useStore(wishlistStore);
  return {
    ids,
    count: ids.length,
    isSaved: (productId: string) => ids.includes(productId),
    toggleSaved(productId: string) {
      const removing = ids.includes(productId);
      wishlistStore.set((current) => (removing ? current.filter((id) => id !== productId) : [...current, productId]));
      return !removing;
    },
  };
}

/* ---------- Orders ---------- */
export type CheckoutInput = { customerName: string; email: string; phone: string; address: string; city: string; notes?: string; payment: PaymentMethod };

export async function placeOrder(input: CheckoutInput, lines: Array<{ productId: string; quantity: number }>): Promise<{ ok: true; order: Order } | { ok: false; error: string }> {
  if (remoteMode) {
    try {
      const order = await request<Order>('/orders', { method: 'POST', body: { ...input, items: lines } });
      lastOrderStore.set(order);
      try { await hydrate(); } catch { /* the order is saved; the lists refresh next time */ }
      return { ok: true, order };
    } catch (error) { return { ok: false, error: message(error) }; }
  }
  const products = productsStore.get();
  const settings = settingsStore.get();
  const items: OrderItem[] = [];
  for (const line of lines) {
    const product = products.find((item) => item.id === line.productId);
    if (!product || !product.active) return { ok: false, error: 'One of the items in your bag is no longer available.' };
    if (line.quantity > product.stock) return { ok: false, error: `Only ${product.stock} of ${product.name} left in stock.` };
    items.push({ productId: product.id, name: product.name, price: product.price, quantity: line.quantity, image: product.image, imageFallback: product.imageFallback });
  }
  if (!items.length) return { ok: false, error: 'Your bag is empty.' };
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = shippingFor(subtotal, settings);
  const highest = ordersStore.get().reduce((max, order) => Math.max(max, Number(order.id.replace(/\D/g, '')) || 0), 10000);
  const order: Order = { id: `SS-${highest + 1}`, userId: sessionStore.get(), ...input, items, subtotal, shipping, total: subtotal + shipping, status: 'Pending', createdAt: now(), updatedAt: now() };
  ordersStore.set((current) => [order, ...current]);
  productsStore.set((current) => current.map((product) => {
    const line = items.find((item) => item.productId === product.id);
    return line ? { ...product, stock: product.stock - line.quantity } : product;
  }));
  lastOrderStore.set(order);
  return { ok: true, order };
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  if (remoteMode) { await request(`/orders/${encodeURIComponent(orderId)}/status`, { method: 'PATCH', body: { status } }); await refresh(); return; }
  const order = ordersStore.get().find((item) => item.id === orderId);
  if (!order || order.status === status) return;
  const restock = status === 'Cancelled' && order.status !== 'Cancelled' ? 1 : order.status === 'Cancelled' && status !== 'Cancelled' ? -1 : 0;
  ordersStore.set((current) => current.map((item) => (item.id === orderId ? { ...item, status, updatedAt: now() } : item)));
  if (restock) {
    productsStore.set((current) => current.map((product) => {
      const line = order.items.find((item) => item.productId === product.id);
      return line ? { ...product, stock: Math.max(0, product.stock + restock * line.quantity) } : product;
    }));
  }
}

/* ---------- Messages, newsletter and settings ---------- */
export async function sendMessage(input: { name: string; email: string; subject: string; body: string }) {
  if (remoteMode) { await request('/messages', { method: 'POST', body: input }); return; }
  messagesStore.set((current) => [{ id: uid('m'), ...input, read: false, createdAt: now() }, ...current]);
}

export async function markMessageRead(id: string) {
  if (remoteMode) { await request(`/messages/${encodeURIComponent(id)}/read`, { method: 'PATCH' }); await refresh(); return; }
  messagesStore.set((current) => current.map((item) => (item.id === id ? { ...item, read: true } : item)));
}

export async function deleteMessage(id: string) {
  if (remoteMode) { await request(`/messages/${encodeURIComponent(id)}`, { method: 'DELETE' }); await refresh(); return; }
  messagesStore.set((current) => current.filter((item) => item.id !== id));
}

export async function subscribe(email: string): Promise<boolean> {
  const address = email.trim().toLowerCase();
  if (remoteMode) return (await request<{ added: boolean }>('/subscribers', { method: 'POST', body: { email: address } })).added;
  if (subscribersStore.get().some((item) => item.email === address)) return false;
  subscribersStore.set((current) => [{ email: address, createdAt: now() }, ...current]);
  return true;
}

export async function removeSubscriber(email: string) {
  if (remoteMode) { await request(`/subscribers/${encodeURIComponent(email)}`, { method: 'DELETE' }); await refresh(); return; }
  subscribersStore.set((current) => current.filter((item) => item.email !== email));
}

export async function saveSettings(next: Settings) {
  if (remoteMode) { await request('/settings', { method: 'PUT', body: next }); await refresh(); return; }
  settingsStore.set(next);
}
