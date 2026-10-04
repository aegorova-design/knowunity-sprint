/**
 * 11 Not quite, hint 1 of 2 — `/explain/[term]/hint-1`. SPEC.md screen 12.
 * One state, the first rung of the hint ladder.
 *
 * Matches the Mockups v2 frame "11 Not quite, hint 1 of 2" (13662:14538).
 *
 * The screen's job is to hand back two things: what Knowie heard, so the
 * student can see where it went wrong, and a nudge that answers *that* rather
 * than restating the question. Demo mode scripts both per term; real mode
 * shows the actual transcript and a hint picked from the judge's
 * `hint_target` — see `HintOneBody.tsx`.
 *
 * **No key-idea chips here.** SPEC.md is explicit: on a hint screen they give
 * the answer away. The chips only come out once the term is resolved.
 *
 * **No transcript correction.** SPEC.md and voice-ux.md both rule it out —
 * fixing the words turns the loop into an editing step. The quote is there to
 * be read, not repaired.
 *
 * Skip is **live**: the term is still open and the student can still act on
 * it. SPEC.md's Skip rule lists 11 among the live screens, and the progress
 * bar has not moved, because nothing has resolved.
 *
 * **Try again spends the rung.** It goes back to the mic carrying the next
 * attempt, so the send after it lands on `12 Partial, hint 2 of 2` instead of
 * looping here. Type instead carries the same rung, because the ladder does
 * not care which way the answer came in.
 *
 * Not to be confused with `/explain/[term]/hint`, the "I don't know" path.
 * That one shows a single nudge and then the reveal, has nothing to quote back
 * and is deliberately Neutral rather than a Miss.
 */

import { notFound } from 'next/navigation';

import { Button } from '@/components/button/Button';
import { Scaffold } from '@/components/scaffold/Scaffold';

import { ActionStack } from '../../ActionStack';
import { ButtonPair } from '../../ButtonPair';
import { readInputMode } from '../../inputModeServer';
import { OtherModeButton } from '../../ModeButtons';
import { withQuery } from '../../href';
import { FIRST_ATTEMPT } from '../../script';
import { TERMS, isTermPosition, nextTermHref } from '../../session';
import { SessionAppBar } from '../SessionAppBar';
import { HintOneBody } from './HintOneBody';

export default async function HintOnePage({ params }: { params: Promise<{ term: string }> }) {
  const { term } = await params;
  if (!isTermPosition(term)) notFound();

  const current = TERMS[term];
  // This screen is always the first rung, whatever the answer arrived as, so
  // the rung it sends on is always the second.
  const nextAttempt = FIRST_ATTEMPT + 1;
  const inputMode = await readInputMode();
  const isText = inputMode.mode === 'type';
  const voiceHref = withQuery(`/explain/${term}/recording`, { attempt: nextAttempt });
  const typeHref = withQuery(`/explain/${term}/type`, { attempt: nextAttempt });

  return (
    <Scaffold
      size="iPhone 13"
      topNavigation={<SessionAppBar term={term} skipHref={nextTermHref(term)} />}
      middleContent={<HintOneBody term={current} />}
      bottomContent={
        <ActionStack
          /* The screen's one Primary. Another go at the mic, on the next rung
             — which is what makes the ladder a ladder. */
          primary={
            <Button
              variant="Primary"
              size="L"
              CTA="Try again"
              showLeftIcon
              leftIcon={isText ? 'keyboard-01' : 'microphone-01'}
              href={isText ? typeHref : voiceHref}
            />
          }
          below={
            <ButtonPair>
              {/* Giving up on the ladder. It skips the second rung and goes
                  straight to the reveal, which records the term as Revealed at
                  0 XP — the same place `12b` lands. */}
              <Button
                variant="Secondary"
                size="M"
                CTA="Show answer"
                showLeftIcon
                leftIcon="eye"
                /* One take behind this screen, which is what the reveal's
                   caption credits. */
                href={withQuery(`/explain/${term}/answer`, { tries: FIRST_ATTEMPT })}
              />
              {/* The text fallback, reachable from every answerable state. It
                  carries the rung: the ladder does not care which way the
                  answer comes in. */}
              <OtherModeButton inputMode={inputMode} voiceHref={voiceHref} typeHref={typeHref} />
            </ButtonPair>
          }
        />
      }
    />
  );
}
