/**
 * The recall session's content and its position arithmetic, held in one place
 * so every term screen reads the same three terms and computes "where am I"
 * the same way. `[term]` is the position in the session — 1, 2, 3 — not the
 * term's name, per SPEC.md.
 *
 * The three terms are the ones the happy path in SPEC.md walks through.
 */

export const TERM_POSITIONS = ['1', '2', '3'] as const;

export type TermPosition = (typeof TERM_POSITIONS)[number];

export type Term = {
  position: TermPosition;
  /** The term itself, as the summary screen lists it. */
  name: string;
  /** The question Knowie asks, as the prompt heading. */
  prompt: string;
  /**
   * The single nudge "I don't know" earns. It points at the idea without
   * naming it — the reveal is one tap away and does the naming.
   */
  hint: string;
};

/** Identical under every prompt: the ask is the same, only the term changes. */
const PROMPT_CAPTION = 'Explain it like you would to a classmate.';

export const TERM_PROMPT_CAPTION = PROMPT_CAPTION;

export const TERMS: Record<TermPosition, Term> = {
  '1': {
    position: '1',
    name: 'Feudalism',
    prompt: 'In your own words, what does feudalism mean?',
    hint: 'Think about what a lord handed out, and what he expected back for it.',
  },
  '2': {
    position: '2',
    name: 'Serfdom',
    prompt: 'In your own words, what does serfdom mean?',
    hint: 'Think about who was tied to the land, and what that stopped them doing.',
  },
  '3': {
    position: '3',
    name: 'Manorialism',
    prompt: 'In your own words, what does manorialism mean?',
    hint: 'Think about the estate itself — who worked it, and who it had to feed.',
  },
};

export function isTermPosition(value: string): value is TermPosition {
  return (TERM_POSITIONS as readonly string[]).includes(value);
}

/** Terms in one recall session — the progress bar's denominator. */
export const TERM_COUNT = TERM_POSITIONS.length;

/**
 * How many terms the student has gone through before this one — what the
 * progress bar counts. SPEC.md's progress rule advances on every resolution,
 * so correct, wrong and skipped all move it; the score does not touch it.
 *
 * 0 before term 1, then 1 and 2, and TERM_COUNT once the last term resolves.
 * progressIndicator turns those into 0, 33, 66, 100.
 */
export function termsDoneBefore(position: TermPosition): number {
  return Number(position) - 1;
}

/**
 * Where a resolution goes — the next term, or the summary after the last one.
 * Skip is a resolution, so Skip uses this too.
 */
export function nextTermHref(position: TermPosition): string {
  return position === '3' ? '/explain/summary' : `/explain/${Number(position) + 1}`;
}

/**
 * The progress bar's accessible name. The numbers are not in here: the
 * component reads them out of current/total as its unit text.
 */
export const PROGRESS_LABEL = 'Session progress';
