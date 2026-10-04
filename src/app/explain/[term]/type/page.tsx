/**
 * 15 + 16 Text fallback — `/explain/[term]/type`. SPEC.md screen 23.
 *
 * Two states on one route: the field is Empty until the student types and
 * Filled after, and Send answer is disabled until there is something to send.
 * The field and the buttons that depend on it live in TypeScreen, a client
 * component; everything the server can render is rendered here and passed in.
 *
 * Skip is live — the student can still act on this term — per SPEC.md's Skip
 * rule, which lists 15/16 among the live screens. It sits in the app bar and
 * "I don't know" sits in the thumb zone, which is the right distance apart:
 * they overlap in mood and not in outcome. A skip leaves the term unanswered
 * and jumps to the next one without showing the answer — "a skip that reveals
 * is just a slower reveal" (sprint-context.md) — while "I don't know" keeps
 * the student on the term and walks them through the hint to the answer. Both
 * score 0 and both come back on the revisit schedule.
 *
 * `?attempt=` rides in from whichever screen sent the student here — a hint
 * screen's Type instead, or Review's — and straight on to the wait, so a typed
 * answer is judged on the rung it was actually written on. Arriving with none
 * is the first attempt, which is what `06 Idle` and `04`'s Type instead mean.
 */

import { notFound } from 'next/navigation';

import { parseAttempt } from '../../script';
import { isTermPosition } from '../../session';
import { TypeAnswerScreen } from './TypeAnswerScreen';

export default async function TypePage({
  params,
  searchParams,
}: {
  params: Promise<{ term: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { term } = await params;
  if (!isTermPosition(term)) notFound();

  const query = await searchParams;

  return (
    <TypeAnswerScreen
      term={term}
      attempt={parseAttempt(query.attempt)}
      // `?keep=1` comes from Cancel on a slow wait and Type instead on "That
      // didn't go through": the answer was never judged, so it comes back.
      keepAnswer={query.keep === '1'}
    />
  );
}
