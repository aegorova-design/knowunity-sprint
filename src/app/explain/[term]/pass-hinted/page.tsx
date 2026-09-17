/**
 * 10b Got it, after a hint — `/explain/[term]/pass-hinted`. SPEC.md screen 11.
 * Reached when a term passes after one or two hints.
 *
 * Matches the Mockups v2 frame "10b Got it, after a hint" (13663:18824).
 *
 * It is `10` with three changes SPEC.md names: a caption that credits the
 * nudge, a `Say it back` button under the Primary, and an outcome line that
 * says `hinted` rather than `unaided`. The verdict itself is still Pass — the
 * student got there — so the header, the pose and the covered chips are the
 * same as `10`'s.
 *
 * Ways in:
 *
 * - the script, on term 3's second attempt (`script.ts`, VERDICTS);
 * - a typed answer of 20 characters or more on any attempt past the first.
 *
 * **What it is worth** comes off the ladder, not the term. SPEC.md's XP table
 * gives 10 after one hint and 5 after two, so the screen reads `?attempt=` —
 * put there by `09 Processing` — and prints what that rung earned. Without it
 * the screen assumes the second attempt, which is the only rung the scripted
 * run reaches this screen on.
 *
 * **Saying it back** is the second state, and it is the one thing on this
 * screen SPEC.md does not draw. See the note above `SAID_BACK_CAPTION`.
 *
 * Skip is **disabled** and the progress bar has already advanced: the term is
 * resolved. SPEC.md's Skip rule names 10b among the disabled screens, and its
 * Progress rule advances "on any resolution". Close stays live.
 */

import { notFound } from 'next/navigation';

import { Button } from '@/components/button/Button';
import { Scaffold } from '@/components/scaffold/Scaffold';
import { VerdictHeader } from '@/components/verdict-header/VerdictHeader';

import { CoveredIdeas } from '../../CoveredIdeas';
import { VerdictActions } from '../../VerdictActions';
import { FIRST_ATTEMPT, hintedXp, parseAttempt, xpLabel } from '../../script';
import { TERMS, isTermPosition, nextTermHref, nextTermLabel } from '../../session';
import { SessionAppBar } from '../SessionAppBar';

import '../../verdictBody.css';

/**
 * The caption the frame draws, before the student says it back.
 */
const CAPTION = 'Took a nudge, and you got there.';

/**
 * And after.
 *
 * SPEC.md gives 10b one state and one line about this: "Say it back →
 * `/explain/[term]/recording` and back to this screen acknowledged." It does
 * not say what acknowledged looks like, and there is no frame for it — so this
 * follows the one place the file does draw the same beat, `13b Answer
 * revealed, said back`, which comes back with the Say it back button gone and
 * a caption naming what the student just did.
 *
 * Nothing else moves. The verdict was already Pass, the chips were already
 * ticked, and SPEC.md's XP table pays nothing for a say-back — so the outcome
 * line is untouched. Saying it back is practice, not a second go.
 */
const SAID_BACK_CAPTION = 'You said it back in your own words.';

type Query = { [key: string]: string | string[] | undefined };

function first(raw: string | string[] | undefined): string | undefined {
  return Array.isArray(raw) ? raw[0] : raw;
}

export default async function PassHintedPage({
  params,
  searchParams,
}: {
  params: Promise<{ term: string }>;
  searchParams: Promise<Query>;
}) {
  const { term } = await params;
  if (!isTermPosition(term)) notFound();

  const query = await searchParams;
  // The rung the answer landed on. One hint means the second attempt, so the
  // hints spent are one fewer — and a screen reached with no attempt on it
  // assumes the scripted one, which is the second.
  const attempt = Math.max(parseAttempt(query.attempt), FIRST_ATTEMPT + 1);
  const xp = hintedXp(attempt - 1);

  const saidBack = first(query['said-back']) === '1';
  const current = TERMS[term];

  return (
    <Scaffold
      size="iPhone 13"
      topNavigation={<SessionAppBar term={term} skipHref="" skipState="Disabled" resolved />}
      middleContent={
        <div className="verdictBody">
          {/* Still a Pass: a hint changes what it was worth, not whether the
              student got there. The pose and the title's colour come with the
              verdict, so the green never carries the result on its own. */}
          <VerdictHeader
            verdict="Pass"
            title="You got it"
            caption={saidBack ? SAID_BACK_CAPTION : CAPTION}
            titleAs="h1"
          />

          <CoveredIdeas label="You covered" ideas={current.keyIdeas} />
        </div>
      }
      bottomContent={
        <VerdictActions
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
          /* Say it back is the whole point of the hinted pass: the student got
             there with help, and this is the offer to own it unaided. It is
             gone once taken — there is nothing to acknowledge twice. */
          secondary={
            saidBack ? undefined : (
              <Button
                variant="Secondary"
                size="M"
                CTA="Say it back"
                showLeftIcon
                leftIcon="microphone-01"
                /* Back to the mic, carrying where to return to. A say-back is
                   not judged — the verdict is settled and SPEC.md's XP table
                   pays nothing for it — so it does not go through `09
                   Processing`, and `07 Recording` sends the take straight
                   back here acknowledged. */
                href={`/explain/${term}/recording?back=${encodeURIComponent(
                  `/explain/${term}/pass-hinted?attempt=${attempt}&said-back=1`,
                )}`}
              />
            )
          }
          /* "hinted" is the word that carries the result into the summary, and
             the number is what the rung earned. */
          outcome={`${xpLabel(xp)} · hinted`}
        />
      }
    />
  );
}
