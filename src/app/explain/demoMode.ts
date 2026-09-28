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
 * state (typedAnswerStore.ts), this is meant to survive a reload — a demo
 * that dies on a refresh mid-walkthrough is not a usable demo mode.
 */

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

/**
 * Reads `?demo=` off a search-params object and applies it to storage if
 * present. Called once on mount from `DemoModeGate`, which is the only place
 * that needs to know the URL — every other reader just wants the flag.
 */
export function applyDemoParam(demoParam: string | null): void {
  if (demoParam === '1') writeStoredFlag(true);
  else if (demoParam === '0') writeStoredFlag(false);
}

export function readDemoMode(): boolean {
  return readStoredFlag();
}
