/**
 * 07 Recording — `/explain/[term]/recording`. SPEC.md screen 19. One state,
 * with a live timer.
 *
 * The Figma frame "07 Recording" (13662:14534) could not be read while this
 * was built — the Desktop Bridge was down and the other Figma connection is
 * rate-limited — so the layout follows SPEC.md and 06 Idle's frame rather than
 * this screen's own. Reconcile before calling it done.
 *
 * The prompt stays in `middleContent`. SPEC.md's component list for 19 names
 * only what changes from 06 — the status line, the waveform, the stop control
 * — and taking the question away while the student is answering it would be a
 * strange thing to do on the one screen where they are mid-sentence. The text
 * fallback keeps its prompt for the whole of 15/16 on the same grounds.
 *
 * Skip is live: SPEC.md's Skip rule lists 07 among the screens where the
 * student can still act on this term.
 *
 * No "Type instead" here, unlike 06 and the hint screen. SPEC.md's "Can do"
 * for this screen is stop, Cancel, Skip and close, and Cancel lands on Idle
 * where text is one tap away — so the fallback stays reachable without adding
 * a control mid-take.
 *
 * **Saying it back** reuses this screen. `10b Got it, after a hint` sends the
 * student here with `?back=`, the screen it wants them returned to, and the
 * take goes straight there when they stop: a say-back is not judged, so it
 * does not pass through `08 Review` or `09 Processing`. Cancel returns there
 * too — the term is already resolved, so Idle would be the wrong place to drop
 * someone who changed their mind.
 *
 * That also settles the bar. The term is resolved on a say-back, so Skip is
 * disabled and the progress bar has already advanced, both by the same SPEC.md
 * rules `10b` itself follows. On an ordinary take nothing changes: Skip is
 * live, per the Skip rule, which lists 07 among the live screens.
 *
 * **`?attempt=`** is the rung of the hint ladder this take is being made on,
 * and it rides through to `09 Processing`, which is what decides the verdict
 * from it. `11 Not quite, hint 1 of 2` sends the student back here with the
 * next rung on the link, so Try again actually advances the ladder instead of
 * looping on the same hint. A take with no attempt on it is the first.
 */

import { notFound } from 'next/navigation';

import { Scaffold } from '@/components/scaffold/Scaffold';

import { withQuery } from '../../href';
import { parseAttempt } from '../../script';
import { TERMS, isTermPosition, nextTermHref } from '../../session';
import { SessionAppBar } from '../SessionAppBar';
import { TermPrompt } from '../TermPrompt';
import { RecordingTake } from './RecordingTake';

import './recordingScreen.css';

/**
 * Where a say-it-back take goes when it is done. Only a path inside the
 * session is honoured: the value arrives in a URL, and a screen must not be
 * talked into sending someone somewhere else by one.
 */
function returnHref(term: string, raw: string | string[] | undefined): string | undefined {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value?.startsWith(`/explain/${term}/`) ? value : undefined;
}

export default async function RecordingPage({
  params,
  searchParams,
}: {
  params: Promise<{ term: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { term } = await params;
  if (!isTermPosition(term)) notFound();

  const query = await searchParams;
  const current = TERMS[term];
  const back = returnHref(term, query.back);
  const attempt = parseAttempt(query.attempt);

  return (
    <Scaffold
      size="iPhone 13"
      topNavigation={
        <SessionAppBar
          term={term}
          skipHref={nextTermHref(term)}
          skipState={back ? 'Disabled' : 'Default'}
          resolved={Boolean(back)}
        />
      }
      middleContent={<TermPrompt prompt={current.prompt} />}
      bottomContent={
        <RecordingTake
          cancelHref={back ?? `/explain/${term}`}
          // A say-back goes straight back where it came from; an ordinary take
          // goes to Review with its rung, which Review hands to the wait.
          reviewHref={back ?? withQuery(`/explain/${term}/review`, { attempt })}
        />
      }
    />
  );
}
