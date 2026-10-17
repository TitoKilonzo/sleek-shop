import { RefreshCw } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { hydrate, productsStore, remoteMode } from '../lib/db';

/**
 * In API mode the first screen waits for the server (so a signed in admin is not sent to the login page on refresh).
 * If the server cannot be reached and products were cached earlier, the app opens from the cache.
 */
export function Boot({ children }: { children: ReactNode }) {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>(() => (!remoteMode ? 'ready' : 'loading'));
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!remoteMode) return;
    let active = true;
    hydrate()
      .then(() => active && setState('ready'))
      .catch(() => active && setState(productsStore.get().length > 0 ? 'ready' : 'error'));
    return () => { active = false; };
  }, [attempt]);

  useEffect(() => {
    if (!remoteMode) return;
    const refresh = () => { if (document.visibilityState === 'visible') hydrate().catch(() => undefined); };
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('online', refresh);
    return () => { document.removeEventListener('visibilitychange', refresh); window.removeEventListener('online', refresh); };
  }, []);

  if (state === 'ready') return <>{children}</>;
  return <div className="boot-screen" role={state === 'error' ? 'alert' : 'status'}>
    <span className="brand-mark">s.</span>
    {state === 'loading' ? <p>Loading</p> : <><h1>We could not reach the store.</h1><p>Please check your connection and try again.</p><button className="button button-primary button-sm" onClick={() => { setState('loading'); setAttempt((n) => n + 1); }}><RefreshCw size={16} /> Try again</button></>}
  </div>;
}
