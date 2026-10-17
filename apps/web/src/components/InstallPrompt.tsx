import { Download, PlusSquare, Share, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePwaInstall } from '../lib/pwa';

const KEY = 'sleekshop.install.dismissed';
const wasDismissed = () => { try { return sessionStorage.getItem(KEY) === '1'; } catch { return false; } };

/** Install popup. Closing it with the X hides it for the rest of the visit. */
export function InstallPrompt() {
  const pwa = usePwaInstall();
  const [ready, setReady] = useState(false);
  const [dismissed, setDismissed] = useState(wasDismissed);
  const [busy, setBusy] = useState(false);

  useEffect(() => { const timer = window.setTimeout(() => setReady(true), 1400); return () => window.clearTimeout(timer); }, []);

  const close = () => { setDismissed(true); try { sessionStorage.setItem(KEY, '1'); } catch { /* the popup simply stays closed for now */ } };
  const install = async () => { setBusy(true); const outcome = await pwa.install(); setBusy(false); if (outcome !== 'unavailable') close(); };

  const available = pwa.canPrompt || pwa.ios;
  if (!ready || dismissed || pwa.installed || !available) return null;

  return <div className="install-popup" role="dialog" aria-modal="false" aria-labelledby="install-title">
    <button className="install-close" onClick={close} aria-label="Close install message"><X size={18} /></button>
    <div className="install-head">
      <img src="/icons/icon-192.png" alt="" width={52} height={52} />
      <div><h2 id="install-title">Install Sleek Shop</h2><p>Get faster access, offline browsing and a full screen app experience on your device.</p></div>
    </div>
    {pwa.canPrompt ? <button className="button button-primary install-action" onClick={install} disabled={busy}><span>{busy ? 'Opening installer' : 'Install app'}</span><Download size={17} /></button> : <ol className="install-steps">
      <li><span className="install-step-icon"><Share size={16} /></span><span>Tap the <strong>Share</strong> button in your browser toolbar.</span></li>
      <li><span className="install-step-icon"><PlusSquare size={16} /></span><span>Choose <strong>Add to Home Screen</strong>, then tap <strong>Add</strong>.</span></li>
    </ol>}
  </div>;
}
