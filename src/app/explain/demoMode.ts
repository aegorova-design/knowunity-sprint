/**
 * Demo mode: the flag that decides whether a screen is running the scripted
 * walkthrough (script.ts, session.ts) or, eventually, the real judge.
 *
 * Off by default — a plain `/explain/...` link runs real mode, gated by the
 * same passcode as `/voice-test` (see sprint plan, stage C). `?demo=1` turns
 * the flag on and saves it in `sessionStorage`, so it survives navigating
 * from term to term without being carried on every link the way `attempt` is
 * — a stray copied link cannot flip it, only a deliberate `?demo=1` or
 * `?demo=0` can. `?demo=0` turns it back off. Leaving the param off entirely
 * leaves whatever was last saved untouched.
 *
 * `sessionStorage`, not an in-memory store: unlike the current turn's working
 * state (turnStore.ts), this is meant to survive a reload — a demo that dies
 * on a refresh mid-walkthrough is not a usable demo mode.
 */

import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'explain:demoMode';

function readStoredFlag(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    // Private browsing, or storage disabled — fall back to off rather than
    // throw; demo mode is a convenience, not something a screen depends on.
    return false;
  }
}

function writeStoredFlag(on: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    if (on) {
      window.sessionStorage.setItem(STORAGE_KEY, '1');
    } else {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Nothing to do if storage is unavailable — the flag just will not
    // persist across a reload this session.
  }
}

/** Fired when `applyDemoParam` changes the saved flag, so readers re-render. */
const CHANGE_EVENT = 'explain:demomodechange';

/**
 * Reads `?demo=` off a search-params object and applies it to storage if
 * present. Called on every navigation from `DemoModeGate`.
 */
export function applyDemoParam(demoParam: string | null): void {
  if (demoParam !== '1' && demoParam !== '0') return;
  const on = demoParam === '1';
  if (on === readStoredFlag()) return;
  writeStoredFlag(on);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/**
 * The flag. An explicit `?demo=` on the current URL wins over what is saved:
 * `DemoModeGate` saves it in an effect, and the page carrying the param
 * renders and runs its own effects before that one does — without this, the
 * one page a demo is entered on would render, and act, in real mode.
 */
export function readDemoMode(): boolean {
  if (typeof window === 'undefined') return false;
  const param = new URLSearchParams(window.location.search).get('demo');
  if (param === '1') return true;
  if (param === '0') return false;
  return readStoredFlag();
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CHANGE_EVENT, onChange);
}

/**
 * Hydration-safe read of the flag for any client component that needs to
 * branch on it. `getServerSnapshot` always says "off" — storage does not
 * exist on the server, and matching that on the very first client render is
 * what avoids a hydration mismatch. That also means the first render of a
 * hard load reads "off" whatever the flag is, so effects that must not run in
 * demo mode check `readDemoMode()` themselves rather than this.
 */
export function useIsDemoMode(): boolean {
  return useSyncExternalStore(subscribe, readDemoMode, () => false);
}
