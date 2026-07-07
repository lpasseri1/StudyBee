'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    // Skip in development — the service worker's cache-first strategy for
    // JS/CSS otherwise serves stale bundles after every code change, which
    // shows up as confusing hydration mismatches during local dev.
    if (process.env.NODE_ENV !== 'production') return;

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Offline support is a nice-to-have; fail silently if unsupported.
      });
    }
  }, []);

  return null;
}
