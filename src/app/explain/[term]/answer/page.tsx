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
 * four ideas the answer contains, not four the student covered. `13b` ticks
 * them, after the student has said them back.
 *
 * **The outcome is Revealed at 0 XP**, and the outcome line prints the zero —
 * SPEC.md: "`+0 XP · revealed`, in the same shape and the same slot as a
 * pass's `+15 XP · unaided`". Nothing on this screen can change it, Say it
 * back included.
 *
 * Skip is **disabled** and the progress bar **has** advanced: this is where
 * the term resolves. SPEC.md's Skip rule names 13 among the disabled screens,
 * and its Progress rule advances "on any resolution". The frame draws the bar
 * unadvanced; see `component-gaps.md`. Close stays live.
 */

import { notFound } from 'next/navigation';

import { Button } from '@/components/button/Button';
import { Scaffold } from '@/components/scaffold/Scaffold';

import { VerdictActions } from '../../VerdictActions';
import { withQuery } from '../../href';
import { TERMS, isTermPosition, nextTermHref, nextTermLabel } from '../../session';
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
 *
 * With no take at all there is nothing to credit, so the line does the other
 * useful thing and points at the button underneath.
 */
const TRIES_WORD: Record<number, string> = { 1: 'once', 2: 'twice', 3: 'three times' };

function caption(tries: number): string {
  if (tries < 1) return 'Read it through, then say it back in your own words.';

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
        <RevealedAnswer
          term={current}
          title="Here’s the idea"
          caption={caption(tries)}
        />
      }
      bottomContent={
        <VerdictActions
          /* Say it back takes the Primary, not Next term. SPEC.md's whole
             point for this screen is that reading an answer is not learning
             it — saying it is. The take is not judged and cannot change the
             outcome; it comes back to `13b` acknowledged. */
          primary={
            <Button
              variant="Primary"
              size="L"
              CTA="Say it back"
              showLeftIcon
              leftIcon="microphone-01"
              href={withQuery(`/explain/${term}/recording`, {
                back: `/explain/${term}/answer/said-back`,
              })}
            />
          }
          /* Secondary, per SPEC.md. The frame draws it Tertiary — moving on is
             allowed but not encouraged — and the intent is unchanged here, only
             the step down from the Primary: Tertiary put the one way forward at
             the lowest emphasis on the screen, below even the ways out on the
             hint screens above it. `13b` promotes it to Primary once the
             saying-back is done. */
          secondary={
            <Button
              variant="Secondary"
              size="M"
              CTA={nextTermLabel(term)}
              showRightIcon
              rightIcon="arrow-right"
              href={nextTermHref(term)}
            />
          }
          /* `+0 XP · revealed`, in the same shape as a pass's `+15 XP ·
             unaided`. The number used to be left off here, on the rule that an
             outcome should be named rather than a zero shown; the design owner
             reversed that, so every outcome line and every summary row now
             carries a number and the word says why it is what it is. */
          outcome={`${xpLabel(REVEALED_XP)} · revealed`}
        />
      }
    />
  );
}
