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

/** What a wait that has run past 5s says — `09b` in demo mode, the checking screen itself in real mode. */
export const SLOW_TITLE = 'Still thinking';
export const SLOW_CAPTION = 'This one is taking a moment. Your answer is safe.';

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

/**
 * A requeued term's second go. The scripted run requeues hibernation, and it
 * passes first time on the way back — hinted, not unaided: the reveal was the
 * help. Any term that reaches a requeue in demo mode runs the same path.
 */
const REQUEUE_VERDICTS: readonly string[] = ['pass-hinted'];

/**
 * A requeue pass gets one hint, then the reveal: a miss on its first attempt is
 * `hint-1`, a miss on its second is `last-miss`. And any pass is `pass-hinted`.
 */
export const REQUEUE_LADDER: readonly string[] = ['hint-1', 'last-miss'];

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
export function verdictSegment(position: TermPosition, attempt: number, requeuePass = false): string {
  const path = requeuePass ? REQUEUE_VERDICTS : VERDICTS[position];
  return path[Math.min(attempt, path.length) - 1];
}

/** Only term 2's first attempt runs long, and only the first time round. SPEC.md is explicit that it is the only one. */
export function isSlowWait(position: TermPosition, attempt: number, requeuePass = false): boolean {
  return position === '2' && attempt === FIRST_ATTEMPT && !requeuePass;
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

export function typedVerdictSegment(attempt: number, length: number, requeuePass = false): string {
  if (length >= TYPED_PASS_LENGTH) {
    // A pass after a rung of the ladder is `10b`, not `10` — and so is any
    // pass on a requeued term.
    return attempt > FIRST_ATTEMPT || requeuePass ? 'pass-hinted' : 'pass';
  }
  const ladder = requeuePass ? REQUEUE_LADDER : ['hint-1', 'hint-2', 'last-miss'];
  return ladder[Math.min(attempt, ladder.length) - 1];
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
  // Revealed, then requeued, then passed on the way back: hinted, at the
  // one-hint rate — the summary follows the final status.
  '2': { variant: 'Hinted', xp: hintedXp(1) },
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
 * Demo mode's sample take for a term, played on the summary sheet in place of
 * a real recording. One file per term, recorded by the design owner reading
 * that term's final scripted take (`heard` in `session.ts`, at the attempt
 * the script ends on). A missing file hides the player; nothing stands in.
 */
export function demoClipHref(position: TermPosition): string {
  // Hibernation's last take is its requeue pass, so its clip is that one —
  // a placeholder path until the design owner records it, like the others.
  return position === '2' ? '/audio/demo/term-2-requeue.m4a' : `/audio/demo/term-${position}.m4a`;
}
