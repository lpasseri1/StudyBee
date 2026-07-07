import { createClient } from '@/lib/supabase/client';

export type AvatarColor =
  | 'amber'
  | 'violet'
  | 'blue'
  | 'emerald'
  | 'rose'
  | 'cyan';

/**
 * Customization slot structure. Each slot holds a cosmetic id (or null if
 * empty) so a future cosmetics catalog/shop can plug items in without
 * changing this shape. `color` is a base-sprite recolor rather than an
 * equippable item, so it's a plain enum rather than an id.
 */
export interface AvatarSlots {
  hat: string | null;
  accessory: string | null;
  color: AvatarColor;
}

export interface Avatar {
  userId: string;
  baseSprite: string;
  slots: AvatarSlots;
  updatedAt: string;
}

export const DEFAULT_AVATAR_SLOTS: AvatarSlots = {
  hat: null,
  accessory: null,
  color: 'amber'
};

interface AvatarRow {
  user_id: string;
  base_sprite: string;
  slots: AvatarSlots;
  updated_at: string;
}

function fromRow(row: AvatarRow): Avatar {
  return {
    userId: row.user_id,
    baseSprite: row.base_sprite,
    slots: { ...DEFAULT_AVATAR_SLOTS, ...row.slots },
    updatedAt: row.updated_at
  };
}

/** Fetches the current user's avatar, creating a default one if none exists yet. */
export async function getOrCreateAvatar(): Promise<Avatar | null> {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('avatars')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;
  if (data) return fromRow(data as AvatarRow);

  const { data: created, error: insertError } = await supabase
    .from('avatars')
    .insert({ user_id: user.id })
    .select('*')
    .single();

  if (insertError) {
    // Code 23505 = unique_violation — another concurrent call (e.g. the header
    // avatar and this page both loading at once) already created the row.
    // Just re-fetch it instead of treating this as a real failure.
    if (insertError.code === '23505') {
      const { data: existing, error: refetchError } = await supabase
        .from('avatars')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (refetchError) throw refetchError;
      return fromRow(existing as AvatarRow);
    }
    throw insertError;
  }
  return fromRow(created as AvatarRow);
}

export async function updateAvatarSlots(slots: Partial<AvatarSlots>): Promise<Avatar> {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  const current = await getOrCreateAvatar();
  const nextSlots = { ...DEFAULT_AVATAR_SLOTS, ...current?.slots, ...slots };

  // Upsert rather than update: if the row somehow doesn't exist yet (e.g. an
  // earlier insert attempt silently failed), this still succeeds instead of
  // matching zero rows and throwing PGRST116.
  const { data, error } = await supabase
    .from('avatars')
    .upsert(
      { user_id: user.id, slots: nextSlots, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
    .select('*')
    .single();

  if (error) throw error;
  return fromRow(data as AvatarRow);
}
