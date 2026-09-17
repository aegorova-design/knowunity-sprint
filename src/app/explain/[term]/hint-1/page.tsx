/**
 * 11 Not quite, hint 1 of 2 — `/explain/[term]/hint-1`. SPEC.md screen 12.
 * One state, the first rung of the hint ladder.
 *
 * Matches the Mockups v2 frame "11 Not quite, hint 1 of 2" (13662:14538).
 *
 * The screen's job is to hand back two things: what Knowie heard, so the
 * student can see where it went wrong, and a nudge that answers *that* rather
 * than restating the question. Both are scripted per term — recognition and
 * judging are hard-coded (sprint-context.md), so the transcript is too.
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

import { AnswerBlock } from '@/components/answer-block/AnswerBlock';
import { Button } from '@/components/button/Button';
import { Scaffold } from '@/components/scaffold/Scaffold';
import { VerdictHeader } from '@/components/verdict-header/VerdictHeader';

import { ActionStack } from '../../ActionStack';
import { ButtonPair } from '../../ButtonPair';
import { withQuery } from '../../href';
import { FIRST_ATTEMPT } from '../../script';
import { TERMS, isTermPosition, nextTermHref } from '../../session';
import { SessionAppBar } from '../SessionAppBar';

import '../../verdictBody.css';

export default async function HintOnePage({ params }: { params: Promise<{ term: string }> }) {
  const { term } = await params;
  if (!isTermPosition(term)) notFound();

  const current = TERMS[term];
  // This screen is always the first rung, whatever the answer arrived as, so
  // the rung it sends on is always the second.
  const nextAttempt = FIRST_ATTEMPT + 1;

  return (
    <Scaffold
      size="iPhone 13"
      topNavigation={<SessionAppBar term={term} skipHref={nextTermHref(term)} />}
      middleContent={
        <div className="verdictBody">
          {/* verdict="Miss" sets the pose and the title's colour together, so
              the coral never carries the result on its own — "Not quite" and
              Knowie's pose say it too.

              **The caption is not frame 11's.** The two frames' captions are
              swapped: frame 11 carries "You have three of the four key ideas"
              over a take about people voting for local leaders, and frame 12
              carries "That's a different idea" over a take that is nearly
              right. Every other layer on each frame agrees with itself — the
              title, the take and the hint label — so the caption is the one
              that moved. Un-swapped here on the design owner's call.

              One word is also cut. The caption arrives reading "Here's a
              **bigger** nudge", which is what it would have said on the second
              rung; on the first there is nothing for it to be bigger than. */}
          <VerdictHeader
            verdict="Miss"
            title="Not quite"
            caption="That&rsquo;s a different idea. Here&rsquo;s a nudge."
            titleAs="h1"
          />

          {/* Figma "cards": the take quoted back, then the nudge that answers
              it. Order matters — the student reads what they said first, so
              the hint lands against it rather than in the abstract. */}
          <div className="verdictCards">
            <AnswerBlock kind="Said" label="What Knowie heard" body={current.heard[0]} />
            <AnswerBlock kind="Hint" label="Hint 1 of 2" body={current.hints[0]} />
          </div>
        </div>
      }
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
              leftIcon="microphone-01"
              href={withQuery(`/explain/${term}/recording`, { attempt: nextAttempt })}
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
              <Button
                variant="Secondary"
                size="M"
                CTA="Type instead"
                showLeftIcon
                leftIcon="keyboard-01"
                href={withQuery(`/explain/${term}/type`, { attempt: nextAttempt })}
              />
            </ButtonPair>
          }
        />
      }
    />
  );
}
