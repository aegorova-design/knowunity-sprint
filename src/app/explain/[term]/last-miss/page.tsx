/**
 * 12b Not quite, last attempt — `/explain/[term]/last-miss`. SPEC.md screen
 * 14. One state, reached when the retry after hint 2 is still wrong.
 *
 * Matches the Mockups v2 frame "12b Not quite, last attempt" (13663:19327).
 *
 * The ladder is spent. What is left is one card — the take that just missed —
 * and one button, and SPEC.md is deliberate about that button existing:
 * "the ladder has nowhere else to go, but the student taps through to the
 * answer rather than being jumped to it." Being moved on without touching
 * anything is what a screen does to you; tapping is what you do.
 *
 * **No hint card.** There is no third rung to show, and repeating the second
 * would pretend the ladder had more to give.
 *
 * **No Try again, and no Type instead.** Not an oversight and not a trap:
 * SPEC.md's "Can do" for this screen is the one action, because another go at
 * the same term is exactly what the ladder has just run out of. The way out is
 * forward, and the reveal is one tap away.
 *
 * Skip is **disabled**, per SPEC.md's Skip rule, which names 12b among the
 * disabled screens — the term can no longer be acted on. The frame draws Skip
 * live; SPEC.md wins on behaviour. The progress bar has **not** advanced, and
 * the frame agrees: the term does not resolve here. It resolves at the reveal,
 * as Revealed at 0 XP. Close stays live.
 */

import { notFound } from 'next/navigation';

import { AnswerBlock } from '@/components/answer-block/AnswerBlock';
import { Button } from '@/components/button/Button';
import { Scaffold } from '@/components/scaffold/Scaffold';
import { VerdictHeader } from '@/components/verdict-header/VerdictHeader';

import { ActionStack } from '../../ActionStack';
import { withQuery } from '../../href';
import { parseAttempt } from '../../script';
import { TERMS, isTermPosition } from '../../session';
import { SessionAppBar } from '../SessionAppBar';

import '../../verdictBody.css';

export default async function LastMissPage({
  params,
  searchParams,
}: {
  params: Promise<{ term: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { term } = await params;
  if (!isTermPosition(term)) notFound();

  const current = TERMS[term];
  // The rung the last take was on is the number of takes behind it, which the
  // reveal's caption credits.
  const tries = parseAttempt((await searchParams).attempt);

  return (
    <Scaffold
      size="iPhone 13"
      topNavigation={<SessionAppBar term={term} skipHref="" skipState="Disabled" />}
      middleContent={
        <div className="verdictBody">
          {/* Still a Miss, and still said in a word and a pose as well as a
              colour. The caption does the work SPEC.md asks of this screen:
              it names the end of the ladder and turns it into an offer, "let's
              look at it together" rather than "you failed". */}
          <VerdictHeader
            verdict="Miss"
            title="Not quite"
            caption="That was the last hint. Let&rsquo;s look at it together."
            titleAs="h1"
          />

          {/* One card. The third take, not the second — the frame reuses the
              take from `12`, which would show the student their previous
              answer straight after speaking again. See `component-gaps.md`. */}
          <div className="verdictCards">
            <AnswerBlock kind="Said" label="What Knowie heard" body={current.heard[2]} />
          </div>
        </div>
      }
      bottomContent={
        <ActionStack
          /* The screen's one Primary and its only action, with nothing under
             it — the frame's `actions` frame holds this button alone. */
          primary={
            <Button
              variant="Primary"
              size="L"
              CTA="Show me the answer"
              showRightIcon
              rightIcon="arrow-right"
              href={withQuery(`/explain/${term}/answer`, { tries })}
            />
          }
        />
      }
    />
  );
}
