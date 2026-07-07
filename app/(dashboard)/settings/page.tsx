'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookMarked,
  CalendarCheck,
  Coins,
  GraduationCap,
  ListChecks,
  Loader2,
  LogOut,
  Timer,
  Trash2,
  Trophy
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/shared/page-header';
import { BeeAvatar } from '@/components/profile/bee-avatar';
import { useStudyBee } from '@/lib/store';
import { useAvatar } from '@/lib/avatar-context';
import { getCreditsBalance } from '@/lib/credits';
import { getTotalHoursStudied } from '@/lib/study-sessions';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function SettingsPage() {
  const router = useRouter();
  const { tasks, notes, grades, events } = useStudyBee();
  const { slots: avatarSlots } = useAvatar();

  const [email, setEmail] = useState<string | null>(null);
  const [hoursStudied, setHoursStudied] = useState(0);
  const [creditsAllTime, setCreditsAllTime] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(
      ({ data }) => setEmail(data.user?.email ?? null),
      (err) => console.error('Failed to get user:', err)
    );

    Promise.all([
      getTotalHoursStudied().catch(() => 0),
      getCreditsBalance().catch(() => ({ balance: 0, lifetimeEarned: 0 }))
    ]).then(([hours, credits]) => {
      setHoursStudied(hours);
      setCreditsAllTime(credits.lifetimeEarned);
      setStatsLoading(false);
    });
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Failed to log out:', err);
      setLoggingOut(false);
    }
  }

  const upcomingThisWeek = events.length; // existing Schedule data has no explicit date range yet
  const tasksCompleted = tasks.filter((t) => t.done).length;
  const averageGrade =
    grades.length > 0
      ? Math.round(
          (grades.reduce((sum, g) => sum + g.score / g.maxScore, 0) / grades.length) * 100
        )
      : null;

  return (
    <div className="grid gap-6">
      <PageHeader title="Settings" description="Manage your account and see your progress." />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
          {email && <CardDescription>{email}</CardDescription>}
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <BeeAvatar slots={avatarSlots} size={64} />
            <div className="flex-1">
              <p className="text-sm font-medium">Your bee avatar</p>
              <p className="text-sm text-muted-foreground">
                Customize hats, accessories, and color on your{' '}
                <Link href="/profile" className="underline underline-offset-2">
                  Profile page
                </Link>
                .
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={handleLogout} disabled={loggingOut}>
              {loggingOut ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="mr-1.5 h-4 w-4" />
              )}
              Log out
            </Button>

            <DeleteAccountDialog />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your stats</CardTitle>
          <CardDescription>A snapshot of your activity across StudyBee.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatTile
            icon={Timer}
            label="Hours studied"
            value={statsLoading ? '—' : `${hoursStudied}h`}
          />
          <StatTile icon={ListChecks} label="Tasks completed" value={`${tasksCompleted}`} />
          <StatTile icon={BookMarked} label="Notes written" value={`${notes.length}`} />
          <StatTile
            icon={GraduationCap}
            label="Average grade"
            value={averageGrade !== null ? `${averageGrade}%` : '—'}
          />
          <StatTile icon={CalendarCheck} label="Schedule events" value={`${upcomingThisWeek}`} />
          <StatTile
            icon={Coins}
            label="Credits earned all-time"
            value={statsLoading ? '—' : `${creditsAllTime}`}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-lg font-semibold leading-none">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function DeleteAccountDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/account/delete', { method: 'POST' });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Failed to delete account');
      router.push('/login');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="mr-1.5 h-4 w-4" />
          Delete account
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete your account?</DialogTitle>
          <DialogDescription>
            This permanently deletes your account and all associated data — avatar, credits, and
            Focus Study history. This can't be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-1.5">
          <Label htmlFor="confirm-delete">Type DELETE to confirm</Label>
          <Input
            id="confirm-delete"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={confirmText !== 'DELETE' || loading}
            onClick={handleDelete}
          >
            {loading && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            Delete permanently
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
