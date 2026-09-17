/**
 * 12 Partial, hint 2 of 2 — `/explain/[term]/hint-2`. SPEC.md screen 13.
 * One state, the last rung of the hint ladder.
 *
 * Matches the Mockups v2 frame "12 Partial, hint 2 of 2" (13662:14543).
 *
 * SPEC.md builds it as "11, with `VerdictHeader verdict="Partial" title="Almost
 * there"` and `AnswerBlock kind="Hint" label="Hint 2 of 2, the last one"`", and
 * everything else about it — the two cards, the three buttons, Skip staying
 * live, the bar not moving — is 11's. The label says "the last one" out loud
 * because after this rung there is no third: the next miss is `12b`, and the
 * only way on from there is the reveal.
 *
 * `verdict="Partial"` rather than `Miss`. The student has most of it, and
 * voice-ux.md's "Be generous" is the whole reason the ladder exists — calling
 * a nearly-right answer a miss would spend the goodwill this screen needs.
 *
 * **No key-idea chips**, per SPEC.md: on a hint screen they give the answer
 * away, and this screen is one idea short of being the answer.
 *
 * Try again spends the last rung, so the send after it lands on `12b`.
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

export default async function HintTwoPage({ params }: { params: Promise<{ term: string }> }) {
  const { term } = await params;
  if (!isTermPosition(term)) notFound();

  const current = TERMS[term];
  // Always the second rung, so the rung it sends on is always the third.
  const nextAttempt = FIRST_ATTEMPT + 2;

  return (
    <Scaffold
      size="iPhone 13"
      // Skip is live: the term is still open and still answerable. SPEC.md's
      // Skip rule lists 12 among the live screens, and the bar has not moved
      // because nothing has resolved.
      topNavigation={<SessionAppBar term={term} skipHref={nextTermHref(term)} />}
      middleContent={
        <div className="verdictBody">
          {/* The caption is frame 11's, not this frame's. The two frames'
              captions are swapped — frame 12 carries "That's a different
              idea" over a take that is nearly right, while frame 11 carries
              this line over a take about people voting. Titles, takes and
              hint labels all agree with their own frame, so the caption is
              the one that moved. Un-swapped on the design owner's call. */}
          <VerdictHeader
            verdict="Partial"
            title="Almost there"
            caption="You have three of the four key ideas."
            titleAs="h1"
          />

          <div className="verdictCards">
            <AnswerBlock kind="Said" label="What Knowie heard" body={current.heard[1]} />
            {/* "the last one" is the warning that the ladder is running out.
                It is the label's job, not the caption's — the caption is busy
                saying how close the answer already is. */}
            <AnswerBlock kind="Hint" label="Hint 2 of 2, the last one" body={current.hints[1]} />
          </div>
        </div>
      }
      bottomContent={
        <ActionStack
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
              {/* Stopping the ladder early. It lands in the same place a third
                  miss would — the reveal, Revealed at 0 XP. */}
              <Button
                variant="Secondary"
                size="M"
                CTA="Show answer"
                showLeftIcon
                leftIcon="eye"
                /* Two takes behind this screen. */
                href={withQuery(`/explain/${term}/answer`, { tries: FIRST_ATTEMPT + 1 })}
              />
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
