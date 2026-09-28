/**
 * The current turn's typed answer, held in memory rather than the URL.
 *
 * `href.ts` documents the session's rule: everything a screen needs travels
 * in the URL, because there is no store. This is the one deliberate
 * exception. A typed answer is the text the real judge (stage C) has to
 * read, and putting a paragraph of a student's own words in a query string
 * is not what that rule was written to cover — it was written for the
 * handful of small, structural values (`attempt`, `seconds`, `back`) that
 * decide where a screen goes next.
 *
 * Deliberately a plain module-level variable, not `sessionStorage`: unlike
 * `demoMode.ts`, this is meant to die on a reload. Reloading mid-term is
 * supposed to land back on Idle for that term (sprint plan, stage C/D) — an
 * in-memory store makes that the default behaviour instead of something a
 * screen has to remember to clear.
 */

let currentAnswer: string | null = null;

export function setTypedAnswer(answer: string): void {
  currentAnswer = answer;
}

export function readTypedAnswer(): string | null {
  return currentAnswer;
}

export function clearTypedAnswer(): void {
  currentAnswer = null;
}
