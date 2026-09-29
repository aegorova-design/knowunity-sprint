'use client';

/**
 * Real mode's answer lives in memory only (`turnStore.ts`), so a reload
 * mid-term loses it. Rather than let Review or Checking render with nothing
 * to play back or send, this bounces back to Idle for the term — sprint
 * plan, stage C: "on reload mid-term, return to Idle." Demo mode never needs
 * this: it has nothing in the store to lose. The check inside the effect
 * reads storage directly, not `useIsDemoMode`: on a hard load that hook
 * reads "off" until hydration settles, which would bounce a reload of a
 * demo-mode Review screen to Idle as if it were a real one with a lost take.
 */

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { readDemoMode, useIsDemoMode } from './demoMode';
import { hasPendingAnswer } from './turnStore';

export function PendingAnswerGuard({ term }: { term: string }) {
  const router = useRouter();
  const isDemo = useIsDemoMode();

  useEffect(() => {
    if (readDemoMode()) return;
    if (!hasPendingAnswer()) router.replace(`/explain/${term}`);
  }, [isDemo, term, router]);

  return null;
}
