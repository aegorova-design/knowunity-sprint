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
 */

import { notFound } from 'next/navigation';

import { Scaffold } from '@/components/scaffold/Scaffold';

import { TERMS, isTermPosition, nextTermHref } from '../session';
import { IdleActions, IdleContent } from './IdleScreen';
import { SessionAppBar } from './SessionAppBar';

export default async function IdlePage({ params }: { params: Promise<{ term: string }> }) {
  const { term } = await params;
  if (!isTermPosition(term)) notFound();

  const current = TERMS[term];

  return (
    <Scaffold
      size="iPhone 13"
      topNavigation={<SessionAppBar term={term} skipHref={nextTermHref(term)} />}
      middleContent={<IdleContent prompt={current.prompt} />}
      bottomContent={<IdleActions term={term} />}
    />
  );
}
