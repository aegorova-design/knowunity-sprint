/**
 * The text fallback for one term on one rung — what `/explain/[term]/type`
 * draws, and what `06 Idle` draws in its place when the session is in type
 * mode, so a typing student lands back on the field rather than the mic.
 */

import type { ReactNode } from 'react';

import { withQuery } from '../../href';
import { OtherModeButton } from '../../ModeButtons';
import { FIRST_ATTEMPT } from '../../script';
import { TERMS, nextTermHref, type TermPosition } from '../../session';
import { readInputMode } from '../../inputModeServer';
import { SessionAppBar } from '../SessionAppBar';
import { TermPrompt } from '../TermPrompt';
import { TypeScreen } from './TypeScreen';

export async function TypeAnswerScreen({
  term,
  attempt,
  keepAnswer = false,
  before,
}: {
  term: TermPosition;
  attempt: number;
  keepAnswer?: boolean;
  /** Rendered ahead of the prompt — `SessionStart` on term 1's Idle. */
  before?: ReactNode;
}) {
  const inputMode = await readInputMode();
  const typeHref = withQuery(`/explain/${term}/type`, { attempt: attempt > FIRST_ATTEMPT ? attempt : undefined });

  return (
    <TypeScreen
      appBar={<SessionAppBar term={term} skipHref={nextTermHref(term)} />}
      prompt={
        <>
          {before}
          <TermPrompt prompt={TERMS[term].prompt} />
        </>
      }
      sendHref={withQuery(`/explain/${term}/checking`, { attempt })}
      hintHref={`/explain/${term}/hint`}
      otherMode={
        <OtherModeButton
          inputMode={inputMode}
          // A rung already spent goes straight back to the mic on that rung;
          // the first attempt goes to Idle, which is where voice starts.
          voiceHref={
            attempt > FIRST_ATTEMPT
              ? withQuery(`/explain/${term}/recording`, { attempt })
              : `/explain/${term}`
          }
          typeHref={typeHref}
        />
      }
      keepAnswer={keepAnswer}
    />
  );
}
