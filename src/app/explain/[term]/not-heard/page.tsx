/**
 * 09c Didn't catch that — `/explain/[term]/not-heard`. SPEC.md screen 17. One
 * state, reached when a take has no audio.
 *
 * Matches the Mockups v2 frame "09c Didn't catch that" (13663:19187).
 *
 * **Neutral, never Miss.** SPEC.md is explicit and voice-ux.md gives the
 * reason — "separate 'misheard' from 'didn't know it'": a mic that heard
 * nothing is not a wrong answer, and dressing it as one charges the student
 * for the microphone's failure. `verdict="Neutral"` sets Knowie's pose and the
 * title's colour together, so the neutral reading is never carried by the
 * colour alone. The same value `13 Answer revealed` and the "I don't know"
 * hint use.
 *
 * **The rung is untouched.** SPEC.md: "retrying costs no rung on the hint
 * ladder — the student returns to whatever attempt they were on." So the
 * `?attempt=` this screen arrives with rides straight back out on both ways
 * of answering, unchanged. Silence is caught *after* the wait rather than
 * before, which is why the student lands here from `09 Processing` and not
 * from `07 Recording`.
 *
 * The layout is `NeutralRetryScreen`, shared with "Couldn't make that out"
 * (an unclear verdict) and "That didn't go through" (a failed request).
 *
 * **Both ways back in.** Try again returns to the mic; Type instead is the
 * text fallback, which has to be reachable from every answerable state — and
 * this is the one screen in the flow where the voice path has just failed, so
 * it is the state that needs it most.
 *
 * Skip is **live** and the progress bar has **not** advanced: nothing
 * resolved, so the term is still the student's to act on. SPEC.md's Skip rule
 * names 09c among the live screens. Close stays live.
 */

import { notFound } from 'next/navigation';

import { withQuery } from '../../href';
import { parseAttempt } from '../../script';
import { isTermPosition } from '../../session';
import { NeutralRetryScreen } from '../NeutralRetryScreen';

export default async function NotHeardPage({
  params,
  searchParams,
}: {
  params: Promise<{ term: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { term } = await params;
  if (!isTermPosition(term)) notFound();

  // The rung the silent take was made on, carried back out untouched.
  const attempt = parseAttempt((await searchParams).attempt);

  return (
    <NeutralRetryScreen
      term={term}
      attempt={attempt}
      title="Didn’t catch that"
      caption="Nothing came through. Have another go, or type it instead."
      retry={{ href: withQuery(`/explain/${term}/recording`, { attempt }), icon: 'microphone-01' }}
    />
  );
}
