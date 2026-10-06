/**
 * Review answers, one term's sheet open — `/explain/review/[term]`. What a
 * term row in the review opens: the review scrolled to that term, with its
 * sheet up.
 */

import { notFound } from 'next/navigation';

import { Scaffold } from '@/components/scaffold/Scaffold';

import { isTermPosition } from '../../session';
import { REVIEW_HREF, SummaryBar, SummaryContent } from '../../summary/SummaryScreen';
import { TermSheet } from '../../summary/[term]/TermSheet';

import '../../summary/[term]/termSheet.css';

export default async function ReviewTermPage({ params }: { params: Promise<{ term: string }> }) {
  const { term } = await params;
  if (!isTermPosition(term)) notFound();

  return (
    <Scaffold
      size="iPhone 13"
      topNavigation={<SummaryBar review behindSheet />}
      middleContent={<SummaryContent review behindSheet focusTerm={term} />}
      showBottomSheetBackground
      bottomSheetOnly={<TermSheet term={term} dismissHref={REVIEW_HREF} review />}
    />
  );
}
