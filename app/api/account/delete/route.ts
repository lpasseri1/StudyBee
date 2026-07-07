import { NextResponse } from 'next/server';

import { createAdminClient, createClient } from '@/lib/supabase/server';

/**
 * Deletes the current user's account. This must run server-side: it uses the
 * Supabase service role key (admin API) to remove the auth.users row, which
 * client code can never be trusted with. Associated rows in `avatars`,
 * `credits`, and `focus_sessions` are removed first — they also cascade via
 * `on delete cascade`, but deleting explicitly keeps this route correct even
 * if that constraint is ever changed.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const admin = createAdminClient();

  const tables = ['avatars', 'credits', 'focus_sessions'];
  for (const table of tables) {
    const { error } = await admin.from(table).delete().eq('user_id', user.id);
    if (error) {
      return NextResponse.json(
        { error: `Failed to remove data from ${table}: ${error.message}` },
        { status: 500 }
      );
    }
  }

  const { error: deleteUserError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteUserError) {
    return NextResponse.json({ error: deleteUserError.message }, { status: 500 });
  }

  await supabase.auth.signOut();

  return NextResponse.json({ ok: true });
}
