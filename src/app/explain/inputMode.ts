/**
 * How the student is answering this session: by voice, or by typing. Session
 * state, not a per-screen default — it changes only when the student taps
 * "Type instead" or "Switch to voice", and every answer surface reads it to
 * decide which way of answering is the Primary.
 *
 * A cookie rather than `sessionStorage`, because the answer surfaces are
 * Server Components: they read it on the server (`inputModeServer.ts`) and
 * draw the right buttons on the first paint, with no voice-then-type flash on
 * a reload. It has no expiry, so it dies with the browser session, and every
 * new session resets it to voice: those links all land on `NEW_SESSION_HREF`,
 * where `SessionStart` sets it on mount — never on render, so a prefetch
 * cannot reset it. A revisit always opens in voice.
 *
 * `denied` is type mode the student did not choose: the mic was refused. The
 * way back to voice becomes an explainer on turning the mic on.
 */

export type InputMode = 'voice' | 'type';

export type InputModeState = { mode: InputMode; micDenied: boolean };

export const INPUT_MODE_COOKIE = 'explain-input-mode';

/** Where every new session starts — the primer, Redo, Start over, the plan's voice step. */
export const NEW_SESSION_HREF = '/explain/1?new=1';

type StoredValue = InputMode | 'denied';

export function parseInputMode(raw: string | undefined): InputModeState {
  if (raw === 'denied') return { mode: 'type', micDenied: true };
  if (raw === 'type') return { mode: 'type', micDenied: false };
  return { mode: 'voice', micDenied: false };
}

/** Client only. Synchronous, so a link's onClick can set it before the navigation it starts. */
export function setInputMode(value: StoredValue): void {
  document.cookie = `${INPUT_MODE_COOKIE}=${value}; path=/; samesite=lax`;
}
