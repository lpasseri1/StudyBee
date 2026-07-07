'use client';

import { Suspense } from 'react';

import { PageHeader } from '@/components/shared/page-header';
import { FocusSession } from '@/components/study/focus-session';

export default function FocusStudyPage() {
  return (
    <div className="grid gap-6">
      <PageHeader
        title="Focus Study"
        description="Distraction-free study time. Earn credits toward avatar cosmetics as you go."
      />
      <Suspense>
        <FocusSession />
      </Suspense>
    </div>
  );
}
