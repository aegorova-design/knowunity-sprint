/**
 * Whether real mode's wait has passed 5s — shared between `CheckingWait`,
 * which owns the clock and changes its words, and `SlowCancel`, which draws
 * "Cancel and try again" in the screen's bottom slot. Demo mode never sets
 * it: its slow wait is its own route, `09b`.
 */

import { useSyncExternalStore } from 'react';

let slow = false;
const listeners = new Set<() => void>();

export function setSlowWait(value: boolean): void {
  if (slow === value) return;
  slow = value;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useSlowWait(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => slow,
    () => false,
  );
}
