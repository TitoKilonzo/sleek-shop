import { useEffect, useState } from 'react';

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> };

let deferred: InstallEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

if (typeof window !== 'undefined') {
  // Registered at start up so the browser event is never missed before React mounts.
  window.addEventListener('beforeinstallprompt', (event) => { event.preventDefault(); deferred = event as InstallEvent; notify(); });
  window.addEventListener('appinstalled', () => { installed = true; deferred = null; notify(); });
}

export const isStandalone = () => typeof window !== 'undefined' && (window.matchMedia('(display-mode: standalone)').matches || window.matchMedia('(display-mode: window-controls-overlay)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);

export const isIosDevice = () => {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

export function usePwaInstall() {
  const [, force] = useState(0);
  useEffect(() => { const listener = () => force((n) => n + 1); listeners.add(listener); return () => { listeners.delete(listener); }; }, []);
  return {
    canPrompt: deferred !== null,
    installed: installed || isStandalone(),
    ios: isIosDevice(),
    async install(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
      if (!deferred) return 'unavailable';
      const event = deferred;
      await event.prompt();
      const choice = await event.userChoice;
      deferred = null;
      if (choice.outcome === 'accepted') installed = true;
      notify();
      return choice.outcome;
    },
  };
}
