'use client';

import { useState } from 'react';
import { Coffee, Coins, Loader2, Play, Square, Timer } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MusicControls } from '@/components/study/music-controls';
import { useFocusSession } from '@/lib/focus-session-context';

const DURATION_OPTIONS_MIN = [15, 25, 45, 60, 90, 120];

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function FocusSession() {
  const session = useFocusSession();
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [starting, setStarting] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStart() {
    setError(null);
    setStarting(true);
    try {
      await session.startSession(selectedMinutes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start the session.');
    } finally {
      setStarting(false);
    }
  }

  async function handleStop() {
    setStopping(true);
    try {
      await session.endSession();
    } finally {
      setStopping(false);
    }
  }

  if (session.status === 'idle') {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Start a Focus Study session</CardTitle>
            <CardDescription>
              Pick a duration (up to 2 hours). Every 10 minutes of active study earns you a
              credit and a 2-minute break.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex flex-wrap gap-2">
              {DURATION_OPTIONS_MIN.map((minutes) => (
                <Button
                  key={minutes}
                  type="button"
                  variant={selectedMinutes === minutes ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedMinutes(minutes)}
                >
                  {minutes} min
                </Button>
              ))}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button onClick={handleStart} disabled={starting} className="w-fit">
              {starting ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-1.5 h-4 w-4" />
              )}
              Start {selectedMinutes} min session
            </Button>
            <p className="text-xs text-muted-foreground">
              While active, other pages are locked in-app, and closing the tab shows a
              confirmation prompt. You can still stop early any time.
            </p>
          </CardContent>
        </Card>
        <MusicControls />
      </div>
    );
  }

  const isBreak = session.status === 'break';
  const plannedSeconds = session.plannedMinutes * 60;
  const elapsedSeconds = plannedSeconds - session.remainingSeconds;
  const progressPct = plannedSeconds > 0 ? (elapsedSeconds / plannedSeconds) * 100 : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card className={isBreak ? 'border-emerald-400' : undefined}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            {isBreak ? (
              <Coffee className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Timer className="h-4 w-4 text-muted-foreground" />
            )}
            {isBreak ? 'On a break' : 'Focus session in progress'}
          </CardTitle>
          <CardDescription>
            {isBreak
              ? `Back to studying in ${formatDuration(session.breakSecondsRemaining)}.`
              : `${formatDuration(session.remainingSeconds)} remaining of ${session.plannedMinutes} min.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Progress value={progressPct} />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Coins className="h-4 w-4 text-amber-500" />
            {session.creditsThisSession} credit{session.creditsThisSession === 1 ? '' : 's'} earned
            this session
          </div>
          <Button
            variant="destructive"
            className="w-fit"
            onClick={handleStop}
            disabled={stopping}
          >
            {stopping ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Square className="mr-1.5 h-4 w-4" />
            )}
            End session
          </Button>
        </CardContent>
      </Card>
      <MusicControls />
    </div>
  );
}
