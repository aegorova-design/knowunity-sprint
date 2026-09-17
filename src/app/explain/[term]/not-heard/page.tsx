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

import { Button } from '@/components/button/Button';
import { Scaffold } from '@/components/scaffold/Scaffold';
import { VerdictHeader } from '@/components/verdict-header/VerdictHeader';

import { ActionStack } from '../../ActionStack';
import { ButtonPair } from '../../ButtonPair';
import { withQuery } from '../../href';
import { parseAttempt } from '../../script';
import { isTermPosition, nextTermHref } from '../../session';
import { SessionAppBar } from '../SessionAppBar';

import '../../verdictBody.css';

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
    <Scaffold
      size="iPhone 13"
      topNavigation={<SessionAppBar term={term} skipHref={nextTermHref(term)} />}
      middleContent={
        <div className="verdictBody">
          {/* No card under it: there is no take to quote back, which is the
              whole of what happened. The frame draws the header alone,
              centred, and nothing else. */}
          <VerdictHeader
            verdict="Neutral"
            title="Didn&rsquo;t catch that"
            caption="Nothing came through. Have another go, or type it instead."
            titleAs="h1"
          />
        </div>
      }
      bottomContent={
        <ActionStack
          /* The screen's one Primary: straight back to the mic, on the same
             rung. */
          primary={
            <Button
              variant="Primary"
              size="L"
              CTA="Try again"
              showLeftIcon
              leftIcon="microphone-01"
              href={withQuery(`/explain/${term}/recording`, { attempt })}
            />
          }
          /* One child, filling the row — the frame's `actions row` at 358,
             not a half of it. See `component-gaps.md`. */
          below={
            <ButtonPair>
              <Button
                variant="Secondary"
                size="M"
                CTA="Type instead"
                showLeftIcon
                leftIcon="keyboard-01"
                href={withQuery(`/explain/${term}/type`, { attempt })}
              />
            </ButtonPair>
          }
        />
      }
    />
  );
}
