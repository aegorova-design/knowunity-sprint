'use client';

/**
 * The verdict body on `12b Not quite, last attempt` — demo mode's scripted
 * card, or real mode's actual transcript. See `hint-1/HintOneBody.tsx` for
 * why this branch has to live in a client component.
 *
 * No hint here in either mode — the ladder is spent — but the header still
 * shows the real verdict pose (Miss or Partial) in real mode: the third
 * attempt can land as a partial as easily as an outright miss, and the
 * screen should not call it a plain Miss when it was closer than that.
 */

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { AnswerBlock } from '@/components/answer-block/AnswerBlock';
import { VerdictHeader, type VerdictHeaderVerdict } from '@/components/verdict-header/VerdictHeader';

import { useIsDemoMode } from '../../demoMode';
import type { Term } from '../../session';
import { readTurn } from '../../turnStore';

import '../../verdictBody.css';

function poseAndCaption(verdict: 'pass' | 'partial' | 'miss' | 'unclear' | undefined): {
  pose: VerdictHeaderVerdict;
  caption: string;
} {
  return verdict === 'partial'
    ? { pose: 'Partial', caption: 'Close, but that was the last hint. Let’s look at it together.' }
    : { pose: 'Miss', caption: 'That was the last hint. Let’s look at it together.' };
}

export function LastMissBody({ term }: { term: Term }) {
  const router = useRouter();
  const isDemo = useIsDemoMode();

  useEffect(() => {
    if (isDemo) return;
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
          <AnswerBlock kind="Said" label="What Knowie heard" body={term.heard[2]} />
        </div>
      </div>
    );
  }

  const turn = readTurn();
  const { pose, caption } = poseAndCaption(turn.verdict?.verdict);

  return (
    <div className="verdictBody">
      <VerdictHeader verdict={pose} title="Not quite" caption={caption} titleAs="h1" />
      <div className="verdictCards">
        <AnswerBlock
          kind="Said"
          label="What Knowie heard"
          body={turn.transcript ? `“${turn.transcript}”` : '“…”'}
        />
      </div>
    </div>
  );
}
