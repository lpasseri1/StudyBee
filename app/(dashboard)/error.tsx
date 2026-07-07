'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-lg font-semibold md:text-2xl">Something went wrong</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        StudyBee ran into an unexpected error. Your data is saved locally, so it should still
        be here after a refresh.
      </p>
      <Button onClick={() => reset()}>Try again</Button>
    </main>
  );
}
