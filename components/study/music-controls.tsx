'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, Music2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { connectAppleMusic } from '@/lib/apple-music';

export function MusicControls() {
  const searchParams = useSearchParams();
  const spotifyConnected = searchParams.get('spotify_connected') === '1';
  const spotifyError = searchParams.get('spotify_error') === '1';

  const [appleConnecting, setAppleConnecting] = useState(false);
  const [appleConnected, setAppleConnected] = useState(false);
  const [appleError, setAppleError] = useState<string | null>(null);

  async function handleConnectAppleMusic() {
    setAppleConnecting(true);
    setAppleError(null);
    try {
      await connectAppleMusic();
      setAppleConnected(true);
    } catch (err) {
      setAppleError(err instanceof Error ? err.message : 'Could not connect Apple Music');
    } finally {
      setAppleConnecting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Music2 className="h-4 w-4 text-muted-foreground" />
          Music
        </CardTitle>
        <CardDescription>Pick a service to play music during your session.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="flex items-center justify-between rounded-md border p-3">
          <div>
            <p className="text-sm font-medium">Spotify</p>
            {spotifyConnected && <p className="text-xs text-emerald-600">Connected</p>}
            {spotifyError && (
              <p className="text-xs text-destructive">
                Couldn't connect — check SPOTIFY_CLIENT_ID/SECRET.
              </p>
            )}
          </div>
          {spotifyConnected ? (
            <Badge variant="secondary">Active</Badge>
          ) : (
            <Button asChild size="sm" variant="outline">
              <a href="/api/auth/spotify">Connect</a>
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between rounded-md border p-3">
          <div>
            <p className="text-sm font-medium">Apple Music</p>
            {appleConnected && <p className="text-xs text-emerald-600">Connected</p>}
            {appleError && <p className="text-xs text-destructive">{appleError}</p>}
            {!appleConnected && !appleError && (
              <p className="text-xs text-muted-foreground">Requires an Apple Music subscription.</p>
            )}
          </div>
          {appleConnected ? (
            <Badge variant="secondary">Active</Badge>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={handleConnectAppleMusic}
              disabled={appleConnecting}
            >
              {appleConnecting && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
              Connect
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
