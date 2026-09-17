/**
 * 10 Got it — `/explain/[term]/pass`. SPEC.md screen 10. One state, reached
 * when a term passes unaided.
 *
 * Matches the Mockups v2 frame "10 Got it" (13662:14537).
 *
 * Two ways in, and both are unaided:
 *
 * - the script, on term 1's first attempt (`script.ts`, VERDICTS);
 * - a typed answer of 20 characters or more on a first attempt, on any term —
 *   SPEC.md, "Mode is not recorded": a typed pass is Unaided at the full 15 XP
 *   and nothing on this screen says it was typed.
 *
 * A pass that took a hint is not this screen. It is `10b`, which carries its
 * own caption, its own XP and a `Say it back` button.
 *
 * Skip is **disabled** here and the progress bar has already advanced: the
 * term is resolved, so there is nothing left to skip and a third of the
 * session is behind the student. Both are SPEC.md rules — the Skip rule names
 * 10 among the disabled screens, and the Progress rule advances "on any
 * resolution". Close stays live: leaving is always allowed.
 */

import { notFound } from 'next/navigation';

import { Button } from '@/components/button/Button';
import { Scaffold } from '@/components/scaffold/Scaffold';
import { VerdictHeader } from '@/components/verdict-header/VerdictHeader';

import { CoveredIdeas } from '../../CoveredIdeas';
import { VerdictActions } from '../../VerdictActions';
import { UNAIDED_XP, xpLabel } from '../../script';
import { TERMS, isTermPosition, nextTermHref, nextTermLabel } from '../../session';
import { SessionAppBar } from '../SessionAppBar';

import '../../verdictBody.css';

export default async function PassPage({ params }: { params: Promise<{ term: string }> }) {
  const { term } = await params;
  if (!isTermPosition(term)) notFound();

  const current = TERMS[term];

  return (
    <Scaffold
      size="iPhone 13"
      topNavigation={<SessionAppBar term={term} skipHref="" skipState="Disabled" resolved />}
      middleContent={
        <div className="verdictBody">
          {/* verdict="Pass" sets the pose and the title's colour together, so
              the green is never the only thing saying this went well — the
              word "You got it" and Knowie's pose say it too. */}
          <VerdictHeader
            verdict="Pass"
            title="You got it"
            caption="Every key idea, first try, no help."
            titleAs="h1"
          />

          {/* The judging model made visible: the four ideas a full answer
              covers, all of them ticked. A hint screen deliberately has no
              chips — there they would give the answer away — but here the term
              is already resolved, so there is nothing left to give away. */}
          <CoveredIdeas label="You covered" ideas={current.keyIdeas} />
        </div>
      }
      bottomContent={
        <VerdictActions
          /* The screen's one Primary, and its only action. Its label changes
             with its destination on the last term. */
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
          /* "unaided" is the word that carries the result into the summary,
             and the number is what SPEC.md's XP table gives an unaided term. */
          outcome={`${xpLabel(UNAIDED_XP)} · unaided`}
        />
      }
    />
  );
}
