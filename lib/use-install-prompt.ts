'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Chrome/Edge fire `beforeinstallprompt` when the site meets PWA installability
 * criteria (valid manifest, service worker, HTTPS). The browser's own install
 * UI is easy to miss, so this captures that event and lets us show an
 * explicit "Install App" button instead of relying on people noticing the
 * small icon in the address bar.
 *
 * Not supported in Safari — there's no equivalent JS API there, since Safari
 * handles installation entirely through its own Share menu.
 */
export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }

    function handleAppInstalled() {
      setInstalled(true);
      setDeferredPrompt(null);
    }

    // Already running as an installed app (standalone display mode)?
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  async function promptInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setDeferredPrompt(null);
  }

  return {
    /** True once the browser has signaled the site can be installed and it isn't already. */
    canInstall: Boolean(deferredPrompt) && !installed,
    installed,
    promptInstall
  };
}
