'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import {
  AvatarSlots,
  DEFAULT_AVATAR_SLOTS,
  getOrCreateAvatar,
  updateAvatarSlots
} from '@/lib/avatar';

interface AvatarContextValue {
  slots: AvatarSlots;
  loading: boolean;
  /** Merges the given fields into the avatar's slots and pushes the update everywhere at once. */
  updateSlots: (patch: Partial<AvatarSlots>) => Promise<void>;
}

const AvatarContext = createContext<AvatarContextValue | null>(null);

/**
 * Loads the signed-in user's avatar once and shares it across every consumer
 * (header avatar, Profile page, Settings page, etc.) via context, so a color
 * change on one page is reflected everywhere immediately — no separate
 * fetch-on-mount per component, and no stale copies.
 */
export function AvatarProvider({ children }: { children: React.ReactNode }) {
  const [slots, setSlots] = useState<AvatarSlots>(DEFAULT_AVATAR_SLOTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getOrCreateAvatar()
      .then((avatar) => {
        if (!cancelled && avatar) setSlots(avatar.slots);
      })
      .catch((err) => console.error('Failed to load avatar:', err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const updateSlots = useCallback(async (patch: Partial<AvatarSlots>) => {
    // Optimistic update so the change feels instant everywhere, then
    // reconcile with whatever the server actually persisted.
    setSlots((prev) => ({ ...prev, ...patch }));
    const updated = await updateAvatarSlots(patch);
    setSlots(updated.slots);
  }, []);

  return (
    <AvatarContext.Provider value={{ slots, loading, updateSlots }}>
      {children}
    </AvatarContext.Provider>
  );
}

export function useAvatar() {
  const ctx = useContext(AvatarContext);
  if (!ctx) throw new Error('useAvatar must be used within AvatarProvider');
  return ctx;
}
