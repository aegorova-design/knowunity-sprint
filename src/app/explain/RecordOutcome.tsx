'use client';

/**
 * Records a term's result in real mode, on the screen where it resolves —
 * `10 Got it`, `10b Got it, after a hint`, `13 Answer revealed`. Renders
 * nothing.
 *
 * Once per pass: a say-back leaves and comes back to the same screen, and
 * must not overwrite the result with the say-back's take. A requeue pass
 * records once more over the first pass, so the summary shows only the last
 * attempt — and drops the earlier take when the last answer had no recording.
 * Demo mode records nothing — its outcomes are the script.
 */

import { useEffect } from 'react';

import { readDemoMode } from './demoMode';
import { hasRecordedOutcome, recordOutcome } from './outcomes';
import type { TermOutcome } from './script';
import type { TermPosition } from './session';
import { dropTake, keepTake } from './sessionTakes';
import { clearTurn, readTurn } from './turnStore';

export function RecordOutcome({
  term,
  variant,
  xp,
  requeuePass = false,
}: {
  term: TermPosition;
  requeuePass?: boolean;
  variant: Exclude<TermOutcome['variant'], 'Skipped'>;
  xp: number;
}) {
  useEffect(() => {
    // Read from storage here, not through `useIsDemoMode`: on a hard load that
    // hook reports "off" until hydration settles, and a write made in that
    // window would put real-mode data into a demo session.
    if (readDemoMode() || hasRecordedOutcome(term, requeuePass)) return;

    const turn = readTurn();
    // Only this term's answer counts. "I don't know" reaches the reveal with
    // no answer at all, and a skip leaves the previous term's in the store.
    const ownAnswer = turn.term === term && turn.transcript !== null;

    recordOutcome(term, {
      variant,
      xp,
      transcript: ownAnswer ? turn.transcript : null,
      inputMode: ownAnswer ? (turn.typedAnswer !== null ? 'typed' : 'voice') : null,
      requeued: requeuePass,
    });

    // The recording that got the final verdict, for the summary to play back.
    if (ownAnswer && turn.audioBlob) {
      keepTake(term, { blob: turn.audioBlob, seconds: turn.audioSeconds });
    } else {
      // No recording behind this result: a take from an earlier pass or an
      // earlier session must not play as if it were the last attempt.
      dropTake(term);
    }

    // The term is resolved: nothing about its answer should reach the next one.
    clearTurn();
  }, [term, variant, xp, requeuePass]);

  return null;
}
