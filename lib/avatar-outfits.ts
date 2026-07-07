import { AvatarSlots, DEFAULT_AVATAR_SLOTS } from '@/lib/avatar';
import { createClient } from '@/lib/supabase/client';

export interface AvatarOutfit {
  id: string;
  name: string;
  slots: AvatarSlots;
  createdAt: string;
}

interface OutfitRow {
  id: string;
  name: string;
  slots: AvatarSlots;
  created_at: string;
}

function fromRow(row: OutfitRow): AvatarOutfit {
  return {
    id: row.id,
    name: row.name,
    slots: { ...DEFAULT_AVATAR_SLOTS, ...row.slots },
    createdAt: row.created_at
  };
}

/** Lists the signed-in user's saved outfits, newest first. */
export async function listOutfits(): Promise<AvatarOutfit[]> {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('avatar_outfits')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as OutfitRow[]).map(fromRow);
}

/** Saves the given slots as a new named outfit. */
export async function saveOutfit(name: string, slots: AvatarSlots): Promise<AvatarOutfit> {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  const { data, error } = await supabase
    .from('avatar_outfits')
    .insert({ user_id: user.id, name: name.trim(), slots })
    .select('*')
    .single();

  if (error) throw error;
  return fromRow(data as OutfitRow);
}

export async function deleteOutfit(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('avatar_outfits').delete().eq('id', id);
  if (error) throw error;
}
