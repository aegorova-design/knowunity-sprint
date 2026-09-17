/**
 * 13b Answer revealed, said back — `/explain/[term]/answer/said-back`.
 * SPEC.md screen 16. One state, reached by taking `13`'s Say it back and
 * finishing the take.
 *
 * Matches the Mockups v2 frame "13b Answer revealed, said back"
 * (13663:18987).
 *
 * It is `13` with three changes SPEC.md names — a title that credits the
 * saying-back, the key ideas ticked, and Next term promoted to the Primary —
 * and one thing deliberately unchanged: **the outcome line still reads
 * `revealed`**. SPEC.md is blunt about it: "The say-back is recorded and never
 * judged. Outcome and XP are unchanged."
 *
 * That is the whole point of the screen. Saying the answer back is worth doing
 * because it is how the term sticks, not because it buys anything — so the
 * screen changes everything about how it *feels* and nothing about what it
 * *counts*. The chips tick because the student said those four ideas; the
 * outcome stays Revealed at 0 XP because they were shown them first.
 *
 * Still `verdict="Neutral"`, held in `RevealedAnswer`: a say-back is not a
 * right answer any more than the reveal before it was a wrong one.
 *
 * Skip is **disabled** and the progress bar has advanced, as on `13` — the
 * term resolved there and is still resolved. Close stays live.
 *
 * The take's length arrives as `?seconds=`, put there by `07 Recording` on the
 * way back. Nothing reads it: there is no player here, and no take to send.
 */

import { notFound } from 'next/navigation';

import { Button } from '@/components/button/Button';
import { Scaffold } from '@/components/scaffold/Scaffold';

import { VerdictActions } from '../../../VerdictActions';
import { TERMS, isTermPosition, nextTermHref, nextTermLabel } from '../../../session';
import { REVEALED_XP, xpLabel } from '../../../script';
import { RevealedAnswer } from '../../RevealedAnswer';
import { SessionAppBar } from '../../SessionAppBar';

export default async function SaidBackPage({ params }: { params: Promise<{ term: string }> }) {
  const { term } = await params;
  if (!isTermPosition(term)) notFound();

  const current = TERMS[term];

  return (
    <Scaffold
      size="iPhone 13"
      topNavigation={<SessionAppBar term={term} skipHref="" skipState="Disabled" resolved />}
      middleContent={
        /* "unaided" in the caption is about the saying-back, not the term:
           they said it in their own words with nothing in front of them. The
           term itself still records as Revealed, which the outcome line below
           keeps saying. */
        <RevealedAnswer
          term={current}
          title="That&rsquo;s the one to remember"
          caption="You said it back in your own words, unaided."
        />
      }
      bottomContent={
        <VerdictActions
          /* Promoted to Primary, per SPEC.md. On `13` moving on was the thing
             not to do yet; here it is the only thing left to do, and there is
             no Say it back under it — the student has just done it. */
          primary={
            <Button
              variant="Primary"
              size="L"
              CTA={nextTermLabel(term)}
              showRightIcon
              rightIcon="arrow-right"
              href={nextTermHref(term)}
            />
          }
          /* Unchanged from `13`, and that is the rule: the say-back is
             recorded, never judged. The zero is the point — it does not move. */
          outcome={`${xpLabel(REVEALED_XP)} · revealed`}
        />
      }
    />
  );
}
