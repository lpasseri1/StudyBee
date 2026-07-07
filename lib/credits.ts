import { createClient } from '@/lib/supabase/client';

export interface CreditsBalance {
  balance: number;
  lifetimeEarned: number;
}

/** Reads the signed-in user's credit balance. Returns zeroed values if no row exists yet. */
export async function getCreditsBalance(): Promise<CreditsBalance> {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return { balance: 0, lifetimeEarned: 0 };

  const { data, error } = await supabase
    .from('credits')
    .select('balance, lifetime_earned')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return { balance: 0, lifetimeEarned: 0 };

  return { balance: data.balance, lifetimeEarned: data.lifetime_earned };
}

/**
 * Awards credits via the `earn_credits` Postgres function (security definer),
 * so the balance and lifetime-earned counters stay consistent server-side.
 * Called from Focus Study break events — see components/study/focus-session.tsx.
 */
export async function earnCredits(amount: number): Promise<CreditsBalance> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('earn_credits', { amount });
  if (error) throw error;
  return { balance: data.balance, lifetimeEarned: data.lifetime_earned };
}

/**
 * Deducts credits via the `spend_credits` Postgres function. Not wired to any
 * UI yet — the cosmetics shop is a future pass — but ready to call once that
 * exists. Throws if the balance is insufficient.
 */
export async function spendCredits(amount: number): Promise<CreditsBalance> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('spend_credits', { amount });
  if (error) throw error;
  return { balance: data.balance, lifetimeEarned: data.lifetime_earned };
}
