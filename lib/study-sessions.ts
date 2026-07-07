import { createClient } from '@/lib/supabase/client';

export interface FocusSessionRow {
  id: string;
  plannedMinutes: number;
  startedAt: string;
  endedAt: string | null;
  activeSeconds: number;
  creditsEarned: number;
}

export async function startFocusSession(plannedMinutes: number): Promise<FocusSessionRow> {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  const { data, error } = await supabase
    .from('focus_sessions')
    .insert({ user_id: user.id, planned_minutes: plannedMinutes })
    .select('*')
    .single();

  if (error) throw error;
  return {
    id: data.id,
    plannedMinutes: data.planned_minutes,
    startedAt: data.started_at,
    endedAt: data.ended_at,
    activeSeconds: data.active_seconds,
    creditsEarned: data.credits_earned
  };
}

/** Call periodically (e.g. on each break/end) to persist progress so a refresh doesn't lose it. */
export async function updateFocusSession(
  sessionId: string,
  patch: { activeSeconds?: number; creditsEarned?: number; ended?: boolean }
) {
  const supabase = createClient();
  const { error } = await supabase
    .from('focus_sessions')
    .update({
      ...(patch.activeSeconds !== undefined && { active_seconds: patch.activeSeconds }),
      ...(patch.creditsEarned !== undefined && { credits_earned: patch.creditsEarned }),
      ...(patch.ended && { ended_at: new Date().toISOString() })
    })
    .eq('id', sessionId);

  if (error) throw error;
}

/** Sums active_seconds across all sessions for the "Total hours studied" stat in Settings. */
export async function getTotalHoursStudied(): Promise<number> {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data, error } = await supabase
    .from('focus_sessions')
    .select('active_seconds')
    .eq('user_id', user.id);

  if (error) throw error;

  const totalSeconds = (data ?? []).reduce((sum, row) => sum + (row.active_seconds ?? 0), 0);
  return Math.round((totalSeconds / 3600) * 10) / 10;
}
