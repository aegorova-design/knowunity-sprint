/**
 * The mocked recall: which verdict each term gives, and how long the wait
 * before it takes. Straight out of SPEC.md, "How the mocked recall behaves".
 *
 * Nothing the student says changes any of this — that is the point. The run is
 * identical every time, which is what makes the demo repeatable. Real
 * recognition and real judging are explicitly not being built this sprint
 * (sprint-context.md, "Not building").
 *
 * It sits beside `session.ts` rather than inside it: that file holds the terms
 * and the position arithmetic, which are the session's content, and this one
 * holds the script the processing screen plays back.
 */

import type { TermPosition } from './session';

/** Every wait but one. SPEC.md: "Every processing wait is 2.5s". */
export const WAIT_MS = 2500;

/**
 * Term 2's first attempt, the one long wait in the run — "about 7s", which
 * crosses the threshold below. `09b` carries the remainder.
 */
export const SLOW_WAIT_MS = 7000;

/**
 * How far into a wait `09b Processing, still thinking` takes over. SPEC.md
 * screen 22: "Entered at 5s into a wait that runs long."
 */
export const SLOW_AFTER_MS = 5000;

/**
 * Where each attempt on each term lands, in order. Read off SPEC.md's verdict
 * table:
 *
 * | 1 | Pass                                                    |
 * | 2 | Miss → hint 1 → Partial → hint 2 → wrong → 12b → reveal |
 * | 3 | Partial → hint 1 → Pass                                 |
 *
 * The reveal at the end of term 2 is not here: `12b` offers it as a button,
 * so it is that screen's link, not an attempt's outcome.
 */
const VERDICTS: Record<TermPosition, readonly string[]> = {
  '1': ['pass'],
  '2': ['hint-1', 'hint-2', 'last-miss'],
  '3': ['hint-1', 'pass-hinted'],
};

/** Attempts are 1-based, the way the hint ladder counts rungs. */
export const FIRST_ATTEMPT = 1;

export function parseAttempt(raw: string | string[] | undefined): number {
  const value = Number(Array.isArray(raw) ? raw[0] : raw);
  return Number.isInteger(value) && value >= FIRST_ATTEMPT ? value : FIRST_ATTEMPT;
}

/**
 * The verdict route for an attempt, as a segment under `/explain/[term]`.
 *
 * An attempt past the end of a term's script settles on its last rung. Only
 * `12b` can be reached that way, and only by retrying a term the script has
 * already run out of answers for, which the scripted run never does.
 */
export function verdictSegment(position: TermPosition, attempt: number): string {
  const path = VERDICTS[position];
  return path[Math.min(attempt, path.length) - 1];
}

/** Only term 2's first attempt runs long. SPEC.md is explicit that it is the only one. */
export function isSlowWait(position: TermPosition, attempt: number): boolean {
  return position === '2' && attempt === FIRST_ATTEMPT;
}

/**
 * A typed answer is judged on length alone — 20 characters or more passes,
 * anything shorter gets a hint (SPEC.md, "Typed answers are judged on length
 * alone"). This is the one place a student's own input decides the outcome, so
 * it overrides the per-term script whenever the answer came in as text.
 *
 * Mode is not recorded: a typed pass is Unaided at the full 15 XP, exactly as
 * a spoken one would be.
 */
export const TYPED_PASS_LENGTH = 20;

/**
 * What an unaided term is worth. SPEC.md, "XP": unaided 15, correct after one
 * hint 10, after two hints 5, revealed 0, skipped 0 — a scripted session
 * collects 25. Only the unaided number is named here, because `10 Got it` is
 * the only screen built so far that has to print one.
 *
 * Mode is not recorded: a typed answer that passes is unaided at the full 15,
 * exactly as a spoken one would be.
 */
export const UNAIDED_XP = 15;

/**
 * What a revealed term is worth. SPEC.md, "XP": revealed 0, skipped 0 — being
 * shown the answer earns nothing, and saying it back afterwards does not
 * change that.
 *
 * Named rather than written as `0` at the two screens that print it, so the
 * zero on `13` and `13b` is the same zero the summary row carries.
 */
export const REVEALED_XP = 0;

/**
 * What a term is worth once a hint has been spent. SPEC.md, "XP": correct
 * after one hint 10, correct after two hints 5. Two is the bottom of the
 * ladder — there is no third hint — so anything past it is still 5.
 *
 * `hints` is the number of rungs the student took before getting there, which
 * is one less than the attempt they got it on.
 */
export function hintedXp(hints: number): number {
  return hints >= 2 ? 5 : 10;
}

export function typedVerdictSegment(attempt: number, length: number): string {
  if (length >= TYPED_PASS_LENGTH) {
    // A pass after a rung of the ladder is `10b`, not `10`.
    return attempt > FIRST_ATTEMPT ? 'pass-hinted' : 'pass';
  }
  return ['hint-1', 'hint-2', 'last-miss'][Math.min(attempt, 3) - 1];
}

/**
 * What each term records once the scripted run is over — the outcome word the
 * summary prints and what it was worth.
 *
 * It is the verdict table above, read at its end: term 1 passes first time, so
 * Unaided; term 2 runs out of ladder at `last-miss` and is shown the answer,
 * so Revealed at nothing; term 3 passes on the rung after one hint, so Hinted
 * at the one-hint rate. Written out rather than derived, because the step
 * SPEC.md cares about — `12b` leading to the reveal — is a link on a screen
 * rather than an entry in `VERDICTS`, and a derivation would have to encode
 * that anyway.
 *
 * The literals match SPEC.md screen 26 exactly: `Feudalism` Unaided `+15 XP`,
 * `Serfdom` Revealed `+0 XP`, `Manorialism` Hinted `+10 XP`. The
 * summary sums this rather than printing 25, so the total cannot drift from
 * the rows above it.
 */
export type TermOutcome = {
  /** The word the row and its badge carry. `termRow`'s four variants. */
  variant: 'Unaided' | 'Hinted' | 'Revealed' | 'Skipped';
  /** What it earned. Revealed and Skipped are worth nothing, and print `+0 XP`. */
  xp: number;
};

export const SESSION_OUTCOMES: Record<TermPosition, TermOutcome> = {
  '1': { variant: 'Unaided', xp: UNAIDED_XP },
  '2': { variant: 'Revealed', xp: 0 },
  '3': { variant: 'Hinted', xp: hintedXp(1) },
};

/**
 * What a row prints in its `xp` slot — always a number, including zero.
 *
 * It used to print nothing when nothing was earned, on the rule that an
 * outcome should be named rather than a zero shown. The design owner reversed
 * that: a revealed or skipped term now reads `+0 XP`, so every row in the
 * summary carries a number and the three of them visibly add up to the total
 * above them. A blank made the reader do that arithmetic with a hole in it.
 *
 * The outcome word beside it is still what says *why* the number is zero, and
 * `13`/`13b` say the same thing in the same shape — `+0 XP · revealed`.
 */
export function xpLabel(xp: number): string {
  return `+${xp} XP`;
}

/**
 * How many attempts a term took in the scripted run — which take the summary
 * plays back, and which of `heard` it quotes.
 *
 * Read off `VERDICTS` rather than written down again: term 1 passes first
 * time, term 2 runs the ladder out, term 3 passes on the rung after a hint.
 */
export function attemptsTaken(position: TermPosition): number {
  return VERDICTS[position].length;
}

/**
 * How long the take the summary plays back runs for, in seconds.
 *
 * Read off the Mockups v2 frame "18 Summary, term tapped" (13662:14542),
 * which draws 0:34. The real length is measured on `07 Recording` and carried
 * to `08 Review` on the URL, but nothing carries it past the verdict — the
 * summary is reached after three terms and a wait — so this is the scripted
 * stand-in, the way the verdicts themselves are. Making it real means keeping
 * per-term session state, which this sprint does not have.
 */
export const SUMMARY_TAKE_SECONDS = 34;

/**
 * Whether a term has a take to play back at all.
 *
 * SPEC.md screen 27: a skipped or typed term shows the answer alone, with no
 * player — "`TakePlayer` must never appear where the student did not record.
 * That is the component's own rule." Skipped is the outcome that says so; a
 * typed answer is not recorded anywhere, because `SESSION_OUTCOMES` carries
 * the verdict and not how it arrived. So in the scripted run this is true for
 * all three terms, and the second shape waits on a session that remembers
 * more than the script does.
 */
export function hasTake(position: TermPosition): boolean {
  return SESSION_OUTCOMES[position].variant !== 'Skipped';
}
