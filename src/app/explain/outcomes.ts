/**
 * What each term actually came to, for every screen after the session: the
 * summary, its sheets, `/plan/to-revisit`, `20 Home, revisit` and `20b`.
 *
 * Demo mode reads `SESSION_OUTCOMES` in `script.ts`, as it always did. Real
 * mode reads what the session recorded, in `sessionStorage` rather than
 * memory: unlike the answer in flight (`turnStore.ts`), a finished term's
 * result should survive a reload of the summary or the plan.
 *
 * A term is recorded once, where it resolves — `10`, `10b` or `13`. A skip is
 * a plain link and records nothing, so a term with no record is Skipped. That
 * covers a skip from any screen, including one halfway down the ladder,
 * without every Skip having to write something.
 */

import { useMemo, useSyncExternalStore } from 'react';

import { useIsDemoMode } from './demoMode';
import { SESSION_OUTCOMES, attemptsTaken, type TermOutcome } from './script';
import { TERMS, TERM_COUNT, TERM_POSITIONS, type TermPosition } from './session';

export type SessionOutcome = TermOutcome & {
  /** The answer that got the final verdict — what "What Knowie heard" quotes. Null when there was none. */
  transcript: string | null;
  /** How that answer came in. Null when there was no answer at all. */
  inputMode: 'voice' | 'typed' | null;
};

export type SessionOutcomes = Record<TermPosition, SessionOutcome>;

type RecordedOutcome = Omit<SessionOutcome, 'variant'> & {
  variant: Exclude<TermOutcome['variant'], 'Skipped'>;
};

const STORAGE_KEY = 'explain:outcomes';

function readRaw(): string | null {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function parseRecorded(raw: string | null): Partial<Record<TermPosition, RecordedOutcome>> {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function readRecorded(): Partial<Record<TermPosition, RecordedOutcome>> {
  return parseRecorded(readRaw());
}

export function hasRecordedOutcome(term: TermPosition): boolean {
  return readRecorded()[term] !== undefined;
}

export function recordOutcome(term: TermPosition, outcome: RecordedOutcome): void {
  try {
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...readRecorded(), [term]: outcome }),
    );
  } catch {
    // Storage off: the summary will read this term as Skipped. Nothing else
    // depends on it.
  }
}

export function clearOutcomes(): void {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
}

function subscribeToNothing() {
  return () => {};
}

/** Undefined on the server and during hydration, where storage cannot be read. */
const UNKNOWN = undefined;

/** Demo mode's run, in the same shape real mode records. */
const SCRIPTED: SessionOutcomes = Object.fromEntries(
  TERM_POSITIONS.map((position) => [
    position,
    {
      ...SESSION_OUTCOMES[position],
      transcript: TERMS[position].passTake ?? TERMS[position].heard[attemptsTaken(position) - 1],
      inputMode: 'voice',
    },
  ]),
) as SessionOutcomes;

/**
 * The session's outcomes, or null until they can be known — on the server,
 * and on the first client render of a hard load. Callers render nothing
 * outcome-shaped while it is null, rather than a number that is about to
 * change.
 */
export function useSessionOutcomes(): SessionOutcomes | null {
  const isDemo = useIsDemoMode();
  // The raw string, not a parsed object: a primitive compares by value, so
  // this snapshot is stable without caching.
  const raw = useSyncExternalStore(subscribeToNothing, readRaw, () => UNKNOWN);

  return useMemo(() => {
    if (isDemo) return SCRIPTED;
    if (raw === UNKNOWN) return null;

    const recorded = parseRecorded(raw);
    return Object.fromEntries(
      TERM_POSITIONS.map((position) => [
        position,
        recorded[position] ?? { variant: 'Skipped', xp: 0, transcript: null, inputMode: null },
      ]),
    ) as SessionOutcomes;
  }, [isDemo, raw]);
}

export function unaidedCount(outcomes: SessionOutcomes): number {
  return TERM_POSITIONS.filter((position) => outcomes[position].variant === 'Unaided').length;
}

export function totalXp(outcomes: SessionOutcomes): number {
  return TERM_POSITIONS.reduce((total, position) => total + outcomes[position].xp, 0);
}

/** Terms coming back for a revisit: everything not unaided. */
export function dueTerms(outcomes: SessionOutcomes): TermPosition[] {
  return TERM_POSITIONS.filter((position) => outcomes[position].variant !== 'Unaided');
}

/** SPEC.md: `/plan/to-revisit` when terms are coming back, `/plan/mastered` when none are. */
export function continueHref(outcomes: SessionOutcomes): string {
  return unaidedCount(outcomes) === TERM_COUNT ? '/plan/mastered' : '/plan/to-revisit';
}

/** "Camouflage", "Camouflage and Mammal", "Camouflage, Hibernation and Mammal". */
export function joinNames(positions: TermPosition[]): string {
  const names = positions.map((position) => TERMS[position].name);
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/**
 * Knowie's line on `19 Plan`: which terms needed what. The scripted run reads
 * "Mammal needed a hint. Hibernation was revealed.", and this is that sentence
 * built from whatever actually happened, in the same order — hinted, then
 * revealed, then skipped.
 */
export function planMessage(outcomes: SessionOutcomes): string {
  const by = (variant: TermOutcome['variant']) =>
    TERM_POSITIONS.filter((position) => outcomes[position].variant === variant);

  const hinted = by('Hinted');
  const revealed = by('Revealed');
  const skipped = by('Skipped');

  return [
    hinted.length ? `${joinNames(hinted)} ${hinted.length === 1 ? 'needed a hint' : 'needed hints'}.` : '',
    revealed.length ? `${joinNames(revealed)} ${revealed.length === 1 ? 'was' : 'were'} revealed.` : '',
    skipped.length ? `${joinNames(skipped)} ${skipped.length === 1 ? 'was' : 'were'} skipped.` : '',
  ]
    .filter(Boolean)
    .join(' ');
}
