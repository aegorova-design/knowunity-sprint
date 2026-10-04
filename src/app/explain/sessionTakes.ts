/**
 * Each term's final take — the recording that got the final verdict — kept
 * for the whole session so the summary can play it back. Real mode only.
 *
 * In memory, not `sessionStorage`: a recording is a Blob, and storage holds
 * strings. So a reload keeps the outcomes (`outcomes.ts`) but loses the
 * audio, and the summary hides the player rather than draw one with nothing
 * behind it.
 */

import type { TermPosition } from './session';

export type SessionTake = { blob: Blob; seconds: number };

const takes = new Map<TermPosition, SessionTake>();

export function keepTake(term: TermPosition, take: SessionTake): void {
  takes.set(term, take);
}

export function readTake(term: TermPosition): SessionTake | undefined {
  return takes.get(term);
}

/** A term whose final answer had no recording — its earlier take must not play as if it were the last. */
export function dropTake(term: TermPosition): void {
  takes.delete(term);
}

export function clearTakes(): void {
  takes.clear();
}
