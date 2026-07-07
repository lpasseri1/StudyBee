'use client';

declare global {
  interface Window {
    MusicKit?: {
      configure: (config: {
        developerToken: string;
        app: { name: string; build: string };
      }) => Promise<MusicKitInstance>;
      getInstance: () => MusicKitInstance;
    };
  }
}

interface MusicKitInstance {
  isAuthorized: boolean;
  authorize: () => Promise<string>; // resolves with the user's music-user-token
  unauthorize: () => Promise<void>;
}

const MUSICKIT_SRC = 'https://js-cdn.music.apple.com/musickit/v3/musickit.js';

let loadPromise: Promise<void> | null = null;

/** Loads the MusicKit JS <script> tag once, reusing the same promise on repeat calls. */
function loadMusicKitScript(): Promise<void> {
  if (window.MusicKit) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = MUSICKIT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load MusicKit JS'));
    document.head.appendChild(script);
  });

  return loadPromise;
}

/**
 * Fetches a developer token from our server, configures MusicKit JS, and
 * prompts the user (via Apple's own popup) to authorize their account.
 * Throws if Apple Music isn't configured server-side, if the user declines,
 * or if the SDK fails to load.
 */
export async function connectAppleMusic(): Promise<string> {
  await loadMusicKitScript();

  const res = await fetch('/api/auth/apple-music/token');
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || 'Could not get an Apple Music developer token');

  const musicKit = await window.MusicKit!.configure({
    developerToken: body.token,
    app: { name: 'StudyBee', build: '1.0.0' }
  });

  const musicUserToken = await musicKit.authorize();
  return musicUserToken;
}
