'use client';

/**
 * `08 Review`'s player: the real recorded take in real mode, `TakePlayback`'s
 * decorative animation everywhere else — demo mode, and the edge case of
 * landing here with no blob in `turnStore` (a reload should already have
 * bounced to Idle via `PendingAnswerGuard`, but this is the fallback rather
 * than a crash).
 */

import { useIsDemoMode } from './demoMode';
import { RealTakePlayback } from './RealTakePlayback';
import { TakePlayback } from './TakePlayback';
import { readTurn } from './turnStore';

export function ReviewPlayback({ seconds, duration }: { seconds: number; duration: string }) {
  const isDemo = useIsDemoMode();
  const blob = isDemo ? null : readTurn().audioBlob;

  if (blob) return <RealTakePlayback blob={blob} seconds={seconds} />;

  return <TakePlayback seconds={seconds} duration={duration} />;
}
