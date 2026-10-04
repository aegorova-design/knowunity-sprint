'use client';

/**
 * Clears the last run's results when a new one starts — rendered on term 1's
 * Idle, which every fresh run passes through: the primer, Redo, Start over
 * and the plan's Voice step all land there. Resume's Continue goes straight
 * to a later term and so keeps the terms already done. Renders nothing.
 *
 * `fresh` is `?new=1`, which only those new-session links carry: it resets the
 * input mode (to voice, or to the primer's `mode`) and empties the requeue,
 * and is then dropped from the URL, so a reload of term 1 keeps the mode the
 * student chose.
 */

import { useEffect } from 'react';

import { readDemoMode } from './demoMode';
import { setInputMode } from './inputMode';
import { clearOutcomes } from './outcomes';
import { clearQueue } from './requeue';
import { clearTakes } from './sessionTakes';
import { resetTurnStore } from './turnStore';

export function SessionStart({ fresh = false, mode }: { fresh?: boolean; mode?: 'type' | 'denied' }) {
  useEffect(() => {
    if (fresh) {
      setInputMode(mode ?? 'voice');
      clearQueue();
      window.history.replaceState(null, '', window.location.pathname);
    }
    if (readDemoMode()) return;
    clearOutcomes();
    clearTakes();
    resetTurnStore();
  }, [fresh, mode]);

  return null;
}
