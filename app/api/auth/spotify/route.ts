import { NextResponse } from 'next/server';

// Scopes needed to control playback from the Focus Study player.
const SPOTIFY_SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-modify-playback-state',
  'user-read-playback-state'
].join(' ');

/**
 * Redirects the user to Spotify's authorization page. Requires
 * SPOTIFY_CLIENT_ID to be set — see .env.example. The callback route
 * exchanges the returned code for tokens.
 */
export async function GET(request: Request) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: 'Spotify is not configured. Set SPOTIFY_CLIENT_ID/SPOTIFY_CLIENT_SECRET.' },
      { status: 501 }
    );
  }

  const redirectUri = new URL('/api/auth/spotify/callback', request.url).toString();

  const authorizeUrl = new URL('https://accounts.spotify.com/authorize');
  authorizeUrl.searchParams.set('response_type', 'code');
  authorizeUrl.searchParams.set('client_id', clientId);
  authorizeUrl.searchParams.set('scope', SPOTIFY_SCOPES);
  authorizeUrl.searchParams.set('redirect_uri', redirectUri);

  return NextResponse.redirect(authorizeUrl.toString());
}
