'use client';

/**
 * The verdict body on `12 Partial, hint 2 of 2` — demo mode's scripted
 * card, or real mode's actual transcript and hint. See `HintOneBody.tsx` for
 * why this branch has to live in a client component, and for how the hint
 * level is picked (stage D: per idea, by how many times it's been targeted).
 */

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { AnswerBlock } from '@/components/answer-block/AnswerBlock';
import { VerdictHeader, type VerdictHeaderVerdict } from '@/components/verdict-header/VerdictHeader';

import { rubric } from '@/lib/judge-config';

import { useIsDemoMode } from '../../demoMode';
import type { Term } from '../../session';
import { hintLevelFor, readTurn } from '../../turnStore';

import '../../verdictBody.css';

function poseAndTitle(verdict: 'pass' | 'partial' | 'miss' | 'unclear' | undefined): {
  pose: VerdictHeaderVerdict;
  title: string;
} {
  return verdict === 'miss' ? { pose: 'Miss', title: 'Not quite' } : { pose: 'Partial', title: 'Almost there' };
}

export function HintTwoBody({ term }: { term: Term }) {
  const router = useRouter();
  const isDemo = useIsDemoMode();

  useEffect(() => {
    if (isDemo) return;
    if (readTurn().verdict === null) router.replace(`/explain/${term.position}`);
  }, [isDemo, term.position, router]);

  if (isDemo) {
    return (
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
          <AnswerBlock kind="Said" label="What Knowie heard" body={term.heard[1]} />
          {/* "the last one" is the warning that the ladder is running out.
              It is the label's job, not the caption's — the caption is busy
              saying how close the answer already is. */}
          <AnswerBlock kind="Hint" label="Hint 2 of 2, the last one" body={term.hints[1]} />
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
          pose === 'Miss'
            ? 'Still not quite. One more nudge before the last try.'
            : 'Close. One more nudge before the last try.'
        }
        titleAs="h1"
      />
      <div className="verdictCards">
        <AnswerBlock
          kind="Said"
          label="What Knowie heard"
          body={turn.transcript ? `“${turn.transcript}”` : '“…”'}
        />
        {hintText && (
          <AnswerBlock kind="Hint" label="Hint 2 of 2, the last one" body={hintText} />
        )}
      </div>
    </div>
  );
}
