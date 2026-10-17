/**
 * Thin client for the Sleek Shop API.
 * VITE_USE_API=true turns on the Turso backed API on the same address as the site.
 * VITE_API_URL is only needed if the API lives on a different address.
 */
export const API_URL = ((import.meta.env.VITE_API_URL as string | undefined) ?? '').trim().replace(/\/$/, '');
export const remoteMode = API_URL !== '' || import.meta.env.VITE_USE_API === 'true';

const TOKEN_KEY = 'sleekshop.v2.token';
export const getToken = (): string => { try { return localStorage.getItem(TOKEN_KEY) ?? ''; } catch { return ''; } };
export const setToken = (token: string) => { try { localStorage.setItem(TOKEN_KEY, token); } catch { /* the session lasts until the page closes */ } };
export const clearToken = () => { try { localStorage.removeItem(TOKEN_KEY); } catch { /* nothing to clear */ } };

export async function request<T = unknown>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const token = getToken();
  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/v1${path}`, {
      method: options.method ?? 'GET',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new Error('Could not reach the server. Please check your connection and try again.');
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error((payload as { error?: string }).error ?? `The request failed (${response.status}).`);
  return (payload as { data: T }).data;
}
