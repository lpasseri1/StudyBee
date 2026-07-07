import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

/**
 * Apple Music doesn't use a redirect-based OAuth flow like Spotify. Instead:
 *  1. This route signs a "developer token" — a JWT proving *this app* is
 *     registered with Apple, valid for up to 6 months.
 *  2. The client (see components/study/music-controls.tsx) loads Apple's
 *     MusicKit JS SDK, configures it with that token, then calls
 *     `musicKit.authorize()`, which pops up Apple's own consent screen for
 *     the *listening user* to grant access to their Apple Music account.
 *     That step never touches our server — Apple handles it directly.
 *
 * Requires an Apple Developer Program membership + a MusicKit identifier's
 * private key. See SUPABASE_SETUP.md for where to get these.
 */
export async function GET() {
  const teamId = process.env.APPLE_MUSIC_TEAM_ID;
  const keyId = process.env.APPLE_MUSIC_KEY_ID;
  const rawPrivateKey = process.env.APPLE_MUSIC_PRIVATE_KEY;

  if (!teamId || !keyId || !rawPrivateKey) {
    return NextResponse.json(
      {
        error:
          'Apple Music is not configured. Set APPLE_MUSIC_TEAM_ID/APPLE_MUSIC_KEY_ID/APPLE_MUSIC_PRIVATE_KEY.'
      },
      { status: 501 }
    );
  }

  // .p8 keys often get their real newlines flattened to literal "\n" when
  // pasted into a single-line env var — restore them before signing.
  const privateKey = rawPrivateKey.includes('\\n')
    ? rawPrivateKey.replace(/\\n/g, '\n')
    : rawPrivateKey;

  try {
    const token = jwt.sign({}, privateKey, {
      algorithm: 'ES256',
      keyid: keyId,
      issuer: teamId,
      expiresIn: '150d' // Apple allows up to 6 months (~180d); stay comfortably under
    });

    return NextResponse.json({ token });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? `Failed to sign developer token: ${err.message}`
            : 'Failed to sign developer token'
      },
      { status: 500 }
    );
  }
}
