/**
 * 06 Idle — `/explain/[term]`. The term prompt, and the mic waiting to be
 * started. One state, per SPEC.md screen 18.
 *
 * Matches the Mockups v2 frame "06 Idle" (13662:14533).
 *
 * Skip is live here — the student can still act on this term — and the
 * progress indicator has not moved for this term yet, per SPEC.md's Skip and
 * Progress rules.
 *
 * What the screen draws lives in `IdleScreen.tsx`, because `06b Leave
 * session, confirm` draws it again underneath its sheet.
 *
 * In type mode (`inputMode.ts`) Idle is the text fallback instead, so a reload
 * mid-term, or the next term, opens in the mode the student chose.
 */

import { notFound } from 'next/navigation';

import { Scaffold } from '@/components/scaffold/Scaffold';

import { parseInputMode } from '../inputMode';
import { readInputMode } from '../inputModeServer';
import { RequeueStart } from '../RequeueEffects';
import { readQueue } from '../requeueServer';
import { FIRST_ATTEMPT, parseAttempt } from '../script';
import { SessionStart } from '../SessionStart';
import { EMPTY_QUEUE, REQUEUE_INTRO, TERMS, isRequeuePass, isTermPosition, nextTermHref } from '../session';
import { IdleActions, IdleContent } from './IdleScreen';
import { SessionAppBar } from './SessionAppBar';
import { TypeAnswerScreen } from './type/TypeAnswerScreen';

function first(raw: string | string[] | undefined): string | undefined {
  return Array.isArray(raw) ? raw[0] : raw;
}

export default async function IdlePage({
  params,
  searchParams,
}: {
  params: Promise<{ term: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { term } = await params;
  if (!isTermPosition(term)) notFound();

  const query = await searchParams;
  // A new session starts clean whatever the cookies still say — voice, or the
  // primer's choice of type — and SessionStart resets them on mount.
  const fresh = term === '1' && first(query.new) === '1';
  const rawMode = first(query.mode);
  const freshMode = rawMode === 'type' || rawMode === 'denied' ? rawMode : undefined;
  const inputMode = fresh ? parseInputMode(freshMode) : await readInputMode();
  const queue = fresh ? EMPTY_QUEUE : await readQueue();
  // `?again=1` is the way into a requeued term; the cookie says so from then on.
  const again = first(query.again) === '1';
  const requeuePass = again || isRequeuePass(term, queue);
  const passQueue = again ? { ...queue, active: term } : queue;

  const current = TERMS[term];
  const before = (
    <>
      {term === '1' ? <SessionStart fresh={fresh} mode={freshMode} /> : null}
      {again ? <RequeueStart term={term} /> : null}
    </>
  );
  const caption = requeuePass ? REQUEUE_INTRO : undefined;
  // `?attempt=` arrives from "Record again" on a failed send: the take is
  // remade on the rung it was lost on. Any other way in is the first attempt.
  const attempt = parseAttempt(query.attempt);
  const laterAttempt = attempt > FIRST_ATTEMPT ? attempt : undefined;

  // Type mode is sticky: Idle in type mode is the field, not the mic.
  if (inputMode.mode === 'type') {
    return (
      <TypeAnswerScreen
        term={term}
        attempt={attempt}
        before={before}
        inputMode={inputMode}
        queue={passQueue}
        promptCaption={caption}
      />
    );
  }

  return (
    <Scaffold
      size="iPhone 13"
      topNavigation={
        <SessionAppBar term={term} skipHref={nextTermHref(term, passQueue)} requeuePass={requeuePass} />
      }
      middleContent={
        <>
          {before}
          <IdleContent prompt={current.prompt} caption={caption} />
        </>
      }
      bottomContent={<IdleActions term={term} attempt={laterAttempt} />}
    />
  );
}
