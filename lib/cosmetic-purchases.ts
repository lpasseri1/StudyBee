import { createClient } from '@/lib/supabase/client';

/** Returns the set of cosmetic ids the signed-in user already owns. */
export async function listOwnedCosmeticIds(): Promise<Set<string>> {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return new Set();

  const { data, error } = await supabase
    .from('cosmetic_purchases')
    .select('cosmetic_id')
    .eq('user_id', user.id);

  if (error) throw error;
  return new Set((data ?? []).map((row) => row.cosmetic_id));
}

/**
 * Spends credits and records ownership atomically via the `purchase_cosmetic`
 * Postgres function — either both happen or neither does. Throws if the
 * item's already owned or the balance is insufficient.
 */
export async function purchaseCosmetic(cosmeticId: string, cost: number): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.rpc('purchase_cosmetic', {
    cosmetic_id: cosmeticId,
    cost
  });
  if (error) throw error;
}
