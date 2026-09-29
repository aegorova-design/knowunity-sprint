'use client';

/**
 * Clears the last run's results when a new one starts — rendered on term 1's
 * Idle, which every fresh run passes through: the primer, Redo, Start over
 * and the plan's Voice step all land there. Resume's Continue goes straight
 * to a later term and so keeps the terms already done. Renders nothing.
 */

import { useEffect } from 'react';

import { readDemoMode } from './demoMode';
import { clearOutcomes } from './outcomes';
import { resetTurnStore } from './turnStore';

export function SessionStart() {
  useEffect(() => {
    if (readDemoMode()) return;
    clearOutcomes();
    resetTurnStore();
  }, []);

  return null;
}
