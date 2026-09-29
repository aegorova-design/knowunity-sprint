'use client';

/**
 * The verdict body on `11 Not quite, hint 1 of 2` — demo mode's scripted
 * card, or real mode's actual transcript and hint.
 *
 * Split out of `page.tsx` because the branch on demo/real mode needs
 * `useIsDemoMode`, a client hook, and `page.tsx` stays a Server Component —
 * the buttons around this stay there, since their hrefs are attempt
 * arithmetic only and do not depend on which mode sent the student here.
 *
 * Real mode's hint text is picked by `turnStore.hintLevelFor` — the idea's
 * first level the first time it's targeted, the second level every time
 * after (stage D). `CheckingWait` is what counts the targeting; this only
 * reads the count.
 */

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { AnswerBlock } from '@/components/answer-block/AnswerBlock';
import { VerdictHeader, type VerdictHeaderVerdict } from '@/components/verdict-header/VerdictHeader';

import { rubric } from '@/lib/judge-config';

import { readDemoMode, useIsDemoMode } from '../../demoMode';
import type { Term } from '../../session';
import { hintLevelFor, readTurn } from '../../turnStore';

import '../../verdictBody.css';

function poseAndTitle(verdict: 'pass' | 'partial' | 'miss' | 'unclear' | undefined): {
  pose: VerdictHeaderVerdict;
  title: string;
} {
  return verdict === 'partial' ? { pose: 'Partial', title: 'Almost there' } : { pose: 'Miss', title: 'Not quite' };
}

export function HintOneBody({ term }: { term: Term }) {
  const router = useRouter();
  const isDemo = useIsDemoMode();

  // Real mode's verdict lives only in turnStore — a reload lost it if it is
  // gone. Sprint plan, stage C: "on reload mid-term, return to Idle."
  useEffect(() => {
    if (readDemoMode()) return;
    if (readTurn().verdict === null) router.replace(`/explain/${term.position}`);
  }, [isDemo, term.position, router]);

  if (isDemo) {
    return (
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
          <AnswerBlock kind="Said" label="What Knowie heard" body={term.heard[0]} />
          <AnswerBlock kind="Hint" label="Hint 1 of 2" body={term.hints[0]} />
        </div>
      </div>
    );
  }

  const turn = readTurn();
  const { pose, title } = poseAndTitle(turn.verdict?.verdict);
  const hintTarget = turn.verdict?.hint_target;
  const rubricTerm = rubric.terms.find((t) => t.id === term.rubricId);
  const hints = rubricTerm?.hints as Record<string, readonly [string, string]> | undefined;
  const hintText = hintTarget ? hints?.[hintTarget]?.[hintLevelFor(term.position, hintTarget)] : undefined;

  return (
    <div className="verdictBody">
      <VerdictHeader
        verdict={pose}
        title={title}
        caption={
          pose === 'Partial'
            ? 'You have part of it. Here’s a nudge.'
            : 'Not quite. Here’s a nudge.'
        }
        titleAs="h1"
      />
      <div className="verdictCards">
        <AnswerBlock
          kind="Said"
          label="What Knowie heard"
          body={turn.transcript ? `“${turn.transcript}”` : '“…”'}
        />
        {hintText && <AnswerBlock kind="Hint" label="Hint 1 of 2" body={hintText} />}
      </div>
    </div>
  );
}
