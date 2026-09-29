/**
 * 18 Summary, term tapped — `/explain/summary/[term]`. SPEC.md screen 27. One
 * term's take and its answer, over the summary it was tapped from.
 *
 * Matches the Mockups v2 frame "18 Summary, term tapped" (13662:14542).
 *
 * The sheet itself is `TermSheet`, a client component, because what it shows
 * is the session's outcome for this term — see there for its two shapes.
 *
 * **The summary is drawn underneath**, not a picture of it: the sheet route
 * renders `SummaryScreen`'s own three slots with `behindSheet`, so the rows
 * and the buttons are the real ones, inert while the sheet is up.
 */

import { notFound } from 'next/navigation';

import { Scaffold } from '@/components/scaffold/Scaffold';

import { isTermPosition } from '../../session';
import { SummaryActions, SummaryBar, SummaryContent } from '../SummaryScreen';
import { TermSheet } from './TermSheet';

import './termSheet.css';

/** The screen underneath — where both ways out of the sheet go. */
const SUMMARY_HREF = '/explain/summary';

export default async function SummaryTermPage({
  params,
}: {
  params: Promise<{ term: string }>;
}) {
  const { term } = await params;
  if (!isTermPosition(term)) notFound();

  return (
    <Scaffold
      size="iPhone 13"
      topNavigation={<SummaryBar behindSheet />}
      middleContent={<SummaryContent behindSheet />}
      bottomContent={<SummaryActions behindSheet />}
      showBottomSheetBackground
      bottomSheetOnly={<TermSheet term={term} dismissHref={SUMMARY_HREF} />}
    />
  );
}
