'use client';

/**
 * Clears the last run's session results when a new one starts — rendered on
 * term 1's Idle, which every fresh run passes through: the primer, Start over
 * and the plan's Explain out loud step all land there with `?new=1`. Without
 * it nothing is cleared: a requeued term 1 and a reload mid-term land on the
 * same Idle. The results history behind the review is never cleared here.
 * Renders nothing.
 *
 * `fresh` is `?new=1`, which only those new-session links carry: it resets the
 * input mode (to voice, or to the primer's `mode`) and empties the requeue,
 * and is then dropped from the URL, so a reload of term 1 keeps the mode the
 * student chose.
 */

import { useEffect } from 'react';

import { readDemoMode } from './demoMode';
import { setInputMode } from './inputMode';
import { clearDemoAfterSession, clearOutcomes } from './outcomes';
import { clearQueue } from './requeue';
import { clearTakes } from './sessionTakes';
import { resetTurnStore } from './turnStore';

export function SessionStart({ fresh = false, mode }: { fresh?: boolean; mode?: 'type' | 'denied' }) {
  useEffect(() => {
    // Only a new session clears anything. Term 1's Idle is also where a
    // requeued term 1 and a reload mid-term land, and neither is a new run.
    if (!fresh) return;
    setInputMode(mode ?? 'voice');
    clearQueue();
    clearDemoAfterSession();
    window.history.replaceState(null, '', window.location.pathname);
    if (readDemoMode()) return;
    clearOutcomes();
    clearTakes();
    resetTurnStore();
  }, [fresh, mode]);

  return null;
}
