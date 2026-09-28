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
};

const EMPTY_STATE: TurnState = {
  typedAnswer: null,
  audioBlob: null,
  audioSeconds: 0,
  transcript: null,
  verdict: null,
};

let state: TurnState = EMPTY_STATE;

export function setTypedAnswer(answer: string): void {
  state = { ...EMPTY_STATE, typedAnswer: answer };
}

export function setAudioTake(blob: Blob, seconds: number): void {
  state = { ...EMPTY_STATE, audioBlob: blob, audioSeconds: seconds };
}

/** Called once the checking screen has a real transcript and verdict. */
export function setJudgeResult(transcript: string, verdict: JudgeVerdict): void {
  state = { ...state, transcript, verdict };
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
