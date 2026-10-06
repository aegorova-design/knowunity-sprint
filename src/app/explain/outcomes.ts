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
import { SESSION_OUTCOMES, UNAIDED_XP, attemptsTaken, hintedXp, type TermOutcome } from './script';
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
  /** Written by a requeue pass — the term's second go, after a reveal. */
  requeued?: boolean;
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

/** Whether this pass has already recorded: the first pass, or — on a requeue pass — the requeue itself. */
export function hasRecordedOutcome(term: TermPosition, requeuePass = false): boolean {
  const recorded = readRecorded()[term];
  return recorded !== undefined && (!requeuePass || recorded.requeued === true);
}

/**
 * Only a revisit session can flip a term to Unaided. A requeue pass is hinted
 * at best — the reveal before it was the help — so an Unaided arriving from
 * one is written as Hinted at the hinted rate. Revisit sessions are not built
 * in v2, so nothing that was revealed or hinted can become Unaided yet.
 */
function guardUnaided(outcome: RecordedOutcome): RecordedOutcome {
  if (!outcome.requeued || outcome.variant !== 'Unaided') return outcome;
  return { ...outcome, variant: 'Hinted', xp: hintedXp(1) };
}

export function recordOutcome(term: TermPosition, outcome: RecordedOutcome): void {
  const guarded = guardUnaided(outcome);
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readRecorded(), [term]: guarded }));
  } catch {
    // Storage off: the summary will read this term as Skipped. Nothing else
    // depends on it.
  }
  recordHistory(term, guarded);
}

/**
 * The history behind the review and the plan: each term's latest result
 * across every session — first pass, requeue, and a revisit once there is
 * one. In `localStorage`, not `sessionStorage`: it has to outlive the
 * session, the tab and a browser restart, and a new session must not clear
 * it. A term is only ever replaced by a newer result; a skip records nothing,
 * so it keeps the last real one. `completedAt` is set when a session reaches
 * its summary, which is what puts "Review answers" in Knowie's bubble on the plan.
 */
const HISTORY_KEY = 'explain:history';

type History = { terms: Partial<Record<TermPosition, RecordedOutcome>>; completedAt?: number };

function readHistoryRaw(): string | null {
  try {
    return window.localStorage.getItem(HISTORY_KEY);
  } catch {
    return null;
  }
}

function parseHistory(raw: string | null): History {
  if (!raw) return { terms: {} };
  try {
    const parsed = JSON.parse(raw);
    return { terms: parsed.terms ?? {}, completedAt: parsed.completedAt };
  } catch {
    return { terms: {} };
  }
}

function writeHistory(history: History): void {
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Storage off: the review falls back to Skipped rows, as the summary does.
  }
}

function recordHistory(term: TermPosition, outcome: RecordedOutcome): void {
  const history = parseHistory(readHistoryRaw());
  writeHistory({ ...history, terms: { ...history.terms, [term]: outcome } });
}

/** Called when a real session reaches its summary. */
export function markSessionCompleted(): void {
  writeHistory({ ...parseHistory(readHistoryRaw()), completedAt: Date.now() });
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
      transcript:
        TERMS[position].requeueTake ??
        TERMS[position].passTake ??
        TERMS[position].heard[attemptsTaken(position) - 1],
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

    return asOutcomes(parseRecorded(raw));
  }, [isDemo, raw]);
}

function asOutcomes(recorded: Partial<Record<TermPosition, RecordedOutcome>>): SessionOutcomes {
  return Object.fromEntries(
    TERM_POSITIONS.map((position) => [
      position,
      recorded[position] ?? { variant: 'Skipped', xp: 0, transcript: null, inputMode: null },
    ]),
  ) as SessionOutcomes;
}

/**
 * Demo mode's two steps after the session, in `sessionStorage` so they last
 * the walkthrough and no longer. The time skip is `20 Home, revisit` — five
 * days later — which makes the revisit due. The revisit itself is stubbed:
 * `20b Revisit complete` records the terms it brought back as revisited, and
 * from then on the latest results read those terms as Unaided, so the review
 * on the mastered plan matches its header. Both are cleared by a new session.
 */
const DEMO_TIME_SKIP_KEY = 'explain:demoTimeSkip';
const DEMO_REVISITED_KEY = 'explain:demoRevisited';

function readSession(key: string): string | null {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeSession(key: string, value: string | null): void {
  try {
    if (value === null) window.sessionStorage.removeItem(key);
    else window.sessionStorage.setItem(key, value);
  } catch {
    // Storage off: the demo stays on the step before.
  }
}

export function markDemoTimeSkip(): void {
  writeSession(DEMO_TIME_SKIP_KEY, '1');
}

/** The terms the stubbed revisit brought back. Written once; later visits keep the first list. */
export function markDemoRevisited(terms: TermPosition[]): void {
  if (readSession(DEMO_REVISITED_KEY) === null) writeSession(DEMO_REVISITED_KEY, JSON.stringify(terms));
}

export function clearDemoAfterSession(): void {
  writeSession(DEMO_TIME_SKIP_KEY, null);
  writeSession(DEMO_REVISITED_KEY, null);
}

function readDemoRevisited(): string | null {
  return readSession(DEMO_REVISITED_KEY);
}

function parseTerms(raw: string | null): TermPosition[] {
  if (!raw) return [];
  try {
    return (JSON.parse(raw) as string[]).filter((value): value is TermPosition =>
      (TERM_POSITIONS as readonly string[]).includes(value),
    );
  } catch {
    return [];
  }
}

/** The terms demo mode's stubbed revisit brought back, or null before it has run. Always null in real mode. */
export function useDemoRevisitedTerms(): TermPosition[] | null {
  const isDemo = useIsDemoMode();
  const raw = useSyncExternalStore(subscribeToNothing, readDemoRevisited, () => null);
  return useMemo(() => (isDemo && raw !== null ? parseTerms(raw) : null), [isDemo, raw]);
}

/** A revisited term, as the stubbed revisit leaves it: explained unaided, its scripted revisit take quoted back. */
function revisited(position: TermPosition): SessionOutcome {
  return {
    variant: 'Unaided',
    xp: UNAIDED_XP,
    transcript: TERMS[position].revisitTake ?? null,
    inputMode: 'voice',
  };
}

/**
 * The merged view: each term's latest result across every session, for the
 * review and the plan. Demo mode reads the script, as the summary does — its
 * run ends with hibernation requeued and passed — with any term its stubbed
 * revisit brought back read as Unaided. Null until it can be known.
 */
export function useLatestOutcomes(): SessionOutcomes | null {
  const isDemo = useIsDemoMode();
  const raw = useSyncExternalStore(subscribeToNothing, readHistoryRaw, () => UNKNOWN);
  const demoRevisited = useDemoRevisitedTerms();

  return useMemo(() => {
    if (isDemo) {
      if (!demoRevisited) return SCRIPTED;
      return Object.fromEntries(
        TERM_POSITIONS.map((position) => [
          position,
          demoRevisited.includes(position) ? revisited(position) : SCRIPTED[position],
        ]),
      ) as SessionOutcomes;
    }
    if (raw === UNKNOWN) return null;
    return asOutcomes(parseHistory(raw).terms);
  }, [isDemo, raw, demoRevisited]);
}

/**
 * How long after a session the terms that needed help are due again — the
 * "couple of days" Knowie names on the plan.
 */
export const REVISIT_AFTER_MS = 2 * 24 * 60 * 60 * 1000;

function readRevisitClock(): string {
  // A string snapshot, so it compares by value: whether the interval has
  // passed since the last completed session, read when the screen renders.
  const { completedAt } = parseHistory(readHistoryRaw());
  return completedAt !== undefined && Date.now() - completedAt >= REVISIT_AFTER_MS ? 'due' : 'not-due';
}

/**
 * Whether the revisit is due: terms still need help, and the interval has
 * passed — in demo mode, the time skip on `20 Home, revisit` has happened and
 * the stubbed revisit has not run yet.
 */
export function useRevisitDue(): boolean {
  const isDemo = useIsDemoMode();
  const latest = useLatestOutcomes();
  const timeSkip = useSyncExternalStore(subscribeToNothing, () => readSession(DEMO_TIME_SKIP_KEY), () => null);
  const clock = useSyncExternalStore(subscribeToNothing, readRevisitClock, () => 'not-due');
  const demoRevisited = useDemoRevisitedTerms();

  if (!latest || dueTerms(latest).length === 0) return false;
  if (isDemo) return timeSkip === '1' && demoRevisited === null;
  return clock === 'due';
}

/** Whether a session has reached its summary — what puts "Review answers" in Knowie's bubble on the plan. Demo mode's walkthrough always has. */
export function useHasCompletedSession(): boolean {
  const isDemo = useIsDemoMode();
  const raw = useSyncExternalStore(subscribeToNothing, readHistoryRaw, () => UNKNOWN);
  if (isDemo) return true;
  return raw !== UNKNOWN && parseHistory(raw).completedAt !== undefined;
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
