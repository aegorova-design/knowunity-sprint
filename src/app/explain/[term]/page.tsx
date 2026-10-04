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

import { readInputMode } from '../inputModeServer';
import { FIRST_ATTEMPT } from '../script';
import { SessionStart } from '../SessionStart';
import { TERMS, isTermPosition, nextTermHref } from '../session';
import { IdleActions, IdleContent } from './IdleScreen';
import { SessionAppBar } from './SessionAppBar';
import { TypeAnswerScreen } from './type/TypeAnswerScreen';

export default async function IdlePage({
  params,
  searchParams,
}: {
  params: Promise<{ term: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { term } = await params;
  // A new session opens in voice whatever the cookie still says; SessionStart
  // resets the cookie on mount.
  const fresh = term === '1' && (await searchParams).new === '1';
  if (!isTermPosition(term)) notFound();

  const current = TERMS[term];
  const sessionStart = term === '1' ? <SessionStart fresh={fresh} /> : null;

  // Type mode is sticky: Idle in type mode is the field, not the mic.
  if (!fresh && (await readInputMode()).mode === 'type') {
    return <TypeAnswerScreen term={term} attempt={FIRST_ATTEMPT} before={sessionStart} />;
  }

  return (
    <Scaffold
      size="iPhone 13"
      topNavigation={<SessionAppBar term={term} skipHref={nextTermHref(term)} />}
      middleContent={
        <>
          {sessionStart}
          <IdleContent prompt={current.prompt} />
        </>
      }
      bottomContent={<IdleActions term={term} />}
    />
  );
}
