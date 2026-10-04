/**
 * 09 Processing — `/explain/[term]/checking`. SPEC.md screen 21. One state,
 * 2.5s, then the verdict the script gives.
 *
 * Matches the Mockups v2 frame "09 Processing" (13662:14536).
 *
 * Skip is **disabled** here — the answer is in flight, so the term can no
 * longer be acted on — per SPEC.md's Skip rule. Close stays live: leaving is
 * always allowed. `bottomContent` is empty, which the frame keeps as 64 of
 * blank thumb zone rather than collapsing.
 *
 * What the wait resolves to is decided in `outcome.ts`, on the server, from
 * the query the sending screen carried:
 *
 * - `seconds=0` — a take with no audio. SPEC.md catches silence **after** the
 *   wait, not before, and sends it to `09c`, which costs no rung on the
 *   ladder.
 * - `typed=<length>` — a text answer, judged on length alone.
 * - otherwise the per-term script, by attempt.
 *
 * `attempt` is the rung of the hint ladder this answer is on, 1-based, and
 * defaults to 1. It rides on to the verdict too, because a verdict has to say
 * what the term recorded and the ladder is what decides that: `10b` prints
 * `+10 XP` after one hint and `+5 XP` after two.
 *
 * **Term 2's first attempt runs long.** That wait hands over to `09b
 * Processing, still thinking` at 5s, with the query intact so the far side
 * resolves to the same verdict this screen would have reached.
 */

import { notFound } from 'next/navigation';

import { Scaffold } from '@/components/scaffold/Scaffold';

import { PendingAnswerGuard } from '../../PendingAnswerGuard';
import { readQueue } from '../../requeueServer';
import { TERMS, isRequeuePass, isTermPosition } from '../../session';
import { SLOW_AFTER_MS, WAIT_MS, isSlowWait, parseAttempt } from '../../script';
import { SessionAppBar } from '../SessionAppBar';
import { CheckingWait } from './CheckingWait';
import { SlowCancel } from './SlowCancel';
import { first, queryString, verdictHref, type Query } from './outcome';

export default async function CheckingPage({
  params,
  searchParams,
}: {
  params: Promise<{ term: string }>;
  searchParams: Promise<Query>;
}) {
  const { term } = await params;
  if (!isTermPosition(term)) notFound();

  const query = await searchParams;
  const attempt = parseAttempt(query.attempt);
  // The long wait is a voice state: a typed answer never runs into 09b.
  const requeuePass = isRequeuePass(term, await readQueue());
  const slow = isSlowWait(term, attempt, requeuePass) && first(query.typed) === undefined;

  return (
    <Scaffold
      size="iPhone 13"
      topNavigation={<SessionAppBar term={term} skipHref="" skipState="Disabled" />}
      middleContent={
        <>
          <PendingAnswerGuard term={term} />
          <CheckingWait
            resolveAfterMs={slow ? SLOW_AFTER_MS : WAIT_MS}
            resolveHref={
              slow
                ? `/explain/${term}/checking/slow${queryString(query)}`
                : verdictHref(term, attempt, query, requeuePass)
            }
            // Real mode ignores the two props above entirely and runs the
            // actual transcribe/judge call instead — see CheckingWait. Demo
            // mode ignores these three.
            term={term}
            rubricId={TERMS[term].rubricId}
            attempt={attempt}
            requeuePass={requeuePass}
            typed={first(query.typed) !== undefined}
          />
        </>
      }
      /* Empty until real mode's wait passes 5s; demo mode's slow wait is its
         own route, 09b, with its own Cancel. */
      bottomContent={<SlowCancel term={term} attempt={attempt} />}
    />
  );
}
