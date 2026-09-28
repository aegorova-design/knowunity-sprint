'use client';

/**
 * Real mode's answer lives in memory only (`turnStore.ts`), so a reload
 * mid-term loses it. Rather than let Review or Checking render with nothing
 * to play back or send, this bounces back to Idle for the term — sprint
 * plan, stage C: "on reload mid-term, return to Idle." Demo mode never needs
 * this: it has nothing in the store to lose, and `useIsDemoMode`'s
 * hydration-safe correction (see `demoMode.ts`) is what keeps a reload of a
 * demo-mode Review screen from being mistaken for a real-mode one with a
 * lost take.
 */

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useIsDemoMode } from './demoMode';
import { hasPendingAnswer } from './turnStore';

export function PendingAnswerGuard({ term }: { term: string }) {
  const router = useRouter();
  const isDemo = useIsDemoMode();

  useEffect(() => {
    if (isDemo) return;
    if (!hasPendingAnswer()) router.replace(`/explain/${term}`);
  }, [isDemo, term, router]);

  return null;
}
