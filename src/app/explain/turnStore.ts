/**
 * The current term's real-mode working data — the answer in flight, and once
 * judged, what the judge actually said. Held in memory, not the URL or
 * `sessionStorage`. See the original note on `typedAnswerStore` (this file
 * replaces it): the URL-only rule in `href.ts` was written for small
 * structural values, not a recorded take or a paragraph of a student's own
 * words, and this store is deliberately reload-fragile — a reload mid-term
 * loses it, which is what sends the student back to Idle rather than trying
 * to resume a submission that no longer has its audio.
 *
 * Demo mode never touches this. It still reads `session.ts`/`script.ts`, as
 * it did before real mode existed.
 */

export type JudgeVerdict = {
  verdict: 'pass' | 'partial' | 'miss' | 'unclear';
  ideas_hit: string[];
  ideas_missing: string[];
  bonus_hit: string[];
  contradiction: string | null;
  hint_target: string | null;
  reason: string;
};

type TurnState = {
  /** Set by the text fallback. Mutually exclusive with the audio fields. */
  typedAnswer: string | null;
  /** Set by a real recording. */
  audioBlob: Blob | null;
  audioSeconds: number;
  /** Set once the checking screen has an answer back from the judge. */
  transcript: string | null;
  verdict: JudgeVerdict | null;
  /**
   * The term that verdict belongs to. A skip is a plain link and clears
   * nothing, so without this the next term could read the last one's
   * transcript as its own.
   */
  term: string | null;
};

const EMPTY_STATE: TurnState = {
  typedAnswer: null,
  audioBlob: null,
  audioSeconds: 0,
  transcript: null,
  verdict: null,
  term: null,
};

let state: TurnState = EMPTY_STATE;

export function setTypedAnswer(answer: string): void {
  state = { ...EMPTY_STATE, typedAnswer: answer };
}

export function setAudioTake(blob: Blob, seconds: number): void {
  state = { ...EMPTY_STATE, audioBlob: blob, audioSeconds: seconds };
}

/** Called once the checking screen has a real transcript and verdict. */
export function setJudgeResult(term: string, transcript: string, verdict: JudgeVerdict): void {
  state = { ...state, transcript, verdict, term };
}

export function readTurn(): Readonly<TurnState> {
  return state;
}

/** Whether there is an answer in flight to judge — what a reload guard checks. */
export function hasPendingAnswer(): boolean {
  return state.typedAnswer !== null || state.audioBlob !== null;
}

/** Called once a term resolves, or is skipped, so the next one starts clean. */
export function clearTurn(): void {
  state = EMPTY_STATE;
}

/**
 * How many times each idea has been the judge's `hint_target` within the
 * current term — what stage D's hint-level rule reads. Separate from
 * `TurnState` above: that resets on every new answer, but this has to
 * survive across a term's several attempts and only reset when the term
 * itself changes.
 */
let hintTargetCounts: Record<string, number> = {};
let hintTargetCountsTerm: string | null = null;

/** Called once, right after a real verdict with a `hint_target` comes back. */
export function recordHintTarget(term: string, ideaId: string): void {
  if (hintTargetCountsTerm !== term) {
    hintTargetCounts = {};
    hintTargetCountsTerm = term;
  }
  hintTargetCounts[ideaId] = (hintTargetCounts[ideaId] ?? 0) + 1;
}

/**
 * Which of an idea's two hint levels to show — 0 the first time it's
 * targeted, 1 every time after. Read *after* `recordHintTarget` has already
 * counted the current occurrence, so a first-time target reads back as 1
 * here and still resolves to level 0.
 */
export function hintLevelFor(term: string, ideaId: string): 0 | 1 {
  if (hintTargetCountsTerm !== term) return 0;
  return (hintTargetCounts[ideaId] ?? 0) >= 2 ? 1 : 0;
}

/** A new session: nothing from the last run carries over. */
export function resetTurnStore(): void {
  state = EMPTY_STATE;
  hintTargetCounts = {};
  hintTargetCountsTerm = null;
}
