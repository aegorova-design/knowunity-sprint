/**
 * 13 Answer revealed — `/explain/[term]/answer`. SPEC.md screen 15. One state,
 * the end of every path that did not get there unaided.
 *
 * Matches the Mockups v2 frame "13 Answer revealed" (13662:14544).
 *
 * Four ways in, and they are why the caption is not a constant:
 *
 * - `11` and `12`'s **Show answer**, after one or two takes;
 * - `12b`'s **Show me the answer**, after the ladder ran out;
 * - `/explain/[term]/hint`'s **Show me the answer**, the "I don't know" path,
 *   where no take was ever made.
 *
 * SPEC.md asks for "a caption that credits the attempt only if there was one",
 * so the number of takes rides in on `?tries=` and the caption is picked from
 * it. Arriving with none credits nothing: a caption must never tell a student
 * they tried when they did not.
 *
 * **The chips are not ticked.** `active="False"`, per SPEC.md: they are the
 * four ideas the answer contains, not four the student covered.
 *
 * **No Say it back.** The retry for a revealed term is the requeue: on its
 * first reveal the term goes to the back of the session queue and comes round
 * once more at the end (`RequeueOnReveal`). A second reveal does not requeue.
 *
 * **The outcome is Revealed at 0 XP**, and the outcome line prints the zero —
 * SPEC.md: "`+0 XP · revealed`, in the same shape and the same slot as a
 * pass's `+15 XP · unaided`". Nothing on this screen can change it.
 *
 * Skip is **disabled** and the progress bar **has** advanced: this is where
 * the term resolves. SPEC.md's Skip rule names 13 among the disabled screens,
 * and its Progress rule advances "on any resolution". The frame draws the bar
 * unadvanced; see `component-gaps.md`. Close stays live.
 */

import { notFound } from 'next/navigation';

import { Button } from '@/components/button/Button';
import { Scaffold } from '@/components/scaffold/Scaffold';

import { RecordOutcome } from '../../RecordOutcome';
import { RequeueOnReveal } from '../../RequeueEffects';
import { VerdictActions } from '../../VerdictActions';
import { readQueue } from '../../requeueServer';
import { TERMS, isRequeuePass, isTermPosition, nextTermHref, nextTermLabel } from '../../session';
import { REVEALED_XP, xpLabel } from '../../script';
import { RevealedAnswer } from '../RevealedAnswer';
import { SessionAppBar } from '../SessionAppBar';

/**
 * How the caption credits the takes behind it.
 *
 * The frame writes the two-take case — "You tried twice, and that's what makes
 * this stick now." — and SPEC.md only asks that the credit be conditional, so
 * the other counts keep that sentence and change its number. Getting the
 * number wrong would be worse than not saying one: a student who tried three
 * times being told they tried twice is being read a script, not talked to.
 */
const TRIES_WORD: Record<number, string> = { 1: 'once', 2: 'twice', 3: 'three times' };

function caption(tries: number): string {
  if (tries < 1) return 'Read it through before you move on.';

  const word = TRIES_WORD[Math.min(tries, 3)];
  return `You tried ${word}, and that’s what makes this stick now.`;
}

function takesBehind(raw: string | string[] | undefined): number {
  const value = Number(Array.isArray(raw) ? raw[0] : raw);
  return Number.isInteger(value) && value > 0 ? value : 0;
}

export default async function AnswerPage({
  params,
  searchParams,
}: {
  params: Promise<{ term: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { term } = await params;
  if (!isTermPosition(term)) notFound();
  const queue = await readQueue();
  const requeuePass = isRequeuePass(term, queue);

  const current = TERMS[term];
  const tries = takesBehind((await searchParams).tries);

  return (
    <Scaffold
      size="iPhone 13"
      topNavigation={<SessionAppBar term={term} skipHref="" skipState="Disabled" resolved />}
      middleContent={
        /* Neutral, not Miss: being shown the answer is not a wrong answer, and
           the title says the same — "Here's the idea", not "You missed it".
           The key ideas ride inside the answer block, unticked: they are what
           the answer contains, not a record of what the student covered. */
        <>
          <RecordOutcome term={term} variant="Revealed" xp={REVEALED_XP} requeuePass={requeuePass} />
          {requeuePass ? null : <RequeueOnReveal term={term} />}
          <RevealedAnswer term={current} title="Here’s the idea" caption={caption(tries)} />
        </>
      }
      bottomContent={
        <VerdictActions
          primary={
            <Button
              variant="Primary"
              size="L"
              CTA={nextTermLabel(term, queue, { revealing: true })}
              showRightIcon
              rightIcon="arrow-right"
              href={nextTermHref(term, queue, { revealing: true })}
            />
          }
          /* `+0 XP · revealed`, in the same shape as a pass's `+15 XP ·
             unaided`. Every outcome line and every summary row carries a
             number, and the word says why it is what it is. */
          outcome={`${xpLabel(REVEALED_XP)} · revealed`}
        />
      }
    />
  );
}
