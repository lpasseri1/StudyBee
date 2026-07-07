import { NextResponse } from 'next/server';

/**
 * Exchanges the authorization code from /api/auth/spotify for an access +
 * refresh token, then stores them in a short-lived httpOnly cookie so the
 * Focus Study music player can call Spotify's Web Playback SDK on the
 * client. Token storage here is intentionally minimal (cookie, not a DB
 * table) since this is scaffolding — swap for persisted per-user storage
 * (e.g. a `spotify_tokens` table keyed by user_id, RLS-protected like the
 * other tables in supabase/migrations/0001_init.sql) if this becomes a real
 * feature.
 */
export async function GET(request: Request) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code || !clientId || !clientSecret) {
    return NextResponse.redirect(`${origin}/study/focus?spotify_error=1`);
  }

  const redirectUri = new URL('/api/auth/spotify/callback', request.url).toString();

  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri
    })
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${origin}/study/focus?spotify_error=1`);
  }

  const tokens = await tokenRes.json();
  const response = NextResponse.redirect(`${origin}/study/focus?spotify_connected=1`);

  response.cookies.set('spotify_access_token', tokens.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: tokens.expires_in
  });

  return response;
}
