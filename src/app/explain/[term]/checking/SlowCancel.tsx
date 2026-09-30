'use client';

/**
 * "Cancel and try again" on real mode's checking screen, once the wait has
 * passed 5s — the same action `09b` gives demo mode, in the same place.
 *
 * Leaving the screen is what cancels: `CheckingWait` aborts its request as it
 * unmounts, and a response that lands later is ignored. The answer is still
 * in `turnStore`, so a take goes back to Review with its length, ready to send
 * again, and a typed answer goes back to the text screen filled in.
 */

import { Button } from '@/components/button/Button';

import { withQuery } from '../../href';
import type { TermPosition } from '../../session';
import { readTurn } from '../../turnStore';
import { useSlowWait } from './slowWait';

export function SlowCancel({ term, attempt }: { term: TermPosition; attempt: number }) {
  const slow = useSlowWait();
  if (!slow) return null;

  const turn = readTurn();
  const href =
    turn.typedAnswer !== null
      ? withQuery(`/explain/${term}/type`, { attempt, keep: 1 })
      : withQuery(`/explain/${term}/review`, { attempt, seconds: turn.audioSeconds });

  return <Button variant="Tertiary" size="M" CTA="Cancel and try again" href={href} />;
}
