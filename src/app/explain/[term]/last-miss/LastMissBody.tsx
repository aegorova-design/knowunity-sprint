'use client';

/**
 * The verdict body on `12b Not quite, last attempt` — demo mode's scripted
 * card, or real mode's actual transcript. See `hint-1/HintOneBody.tsx` for
 * why this branch has to live in a client component.
 *
 * No hint here in either mode — the ladder is spent. The title stays
 * `feedback.error.onSubtle` (verdict="Miss") in real mode too, whatever the
 * third attempt's actual verdict was: this screen is where the ladder runs
 * out, not a graded read on how close that last attempt came, so it does
 * not borrow Partial's orange the way hint-1/hint-2 correctly do.
 */

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { VerdictHeader } from '@/components/verdict-header/VerdictHeader';

import { readDemoMode, useIsDemoMode } from '../../demoMode';
import { SaidAnswer } from '../../SaidAnswer';
import type { Term } from '../../session';
import { readTurn } from '../../turnStore';

import '../../verdictBody.css';

export function LastMissBody({
  term,
  sessionTyped = false,
}: {
  term: Term;
  /** The session is in type mode — demo mode's only clue to how the answer came in. */
  sessionTyped?: boolean;
}) {
  const router = useRouter();
  const isDemo = useIsDemoMode();

  useEffect(() => {
    if (readDemoMode()) return;
    if (readTurn().verdict === null) router.replace(`/explain/${term.position}`);
  }, [isDemo, term.position, router]);

  if (isDemo) {
    return (
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
          <SaidAnswer text={term.heard[2]} typed={sessionTyped} />
        </div>
      </div>
    );
  }

  const turn = readTurn();

  return (
    <div className="verdictBody">
      <VerdictHeader
        verdict="Miss"
        title="Not quite"
        caption="That was the last hint. Let&rsquo;s look at it together."
        titleAs="h1"
      />
      <div className="verdictCards">
        <SaidAnswer text={turn.transcript} typed={turn.typedAnswer !== null} />
      </div>
    </div>
  );
}
