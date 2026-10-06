/**
 * Review answers — `/explain/review`. The summary, reopened from the
 * plan after the session is over: the latest result for each term across
 * every session, read-only, with a back arrow to the plan in place of Close
 * and Continue. See `SummaryScreen.tsx`.
 */

import { Scaffold } from '@/components/scaffold/Scaffold';

import { SummaryBar, SummaryContent } from '../summary/SummaryScreen';

export default function ReviewPage() {
  return <Scaffold size="iPhone 13" topNavigation={<SummaryBar review />} middleContent={<SummaryContent review />} />;
}
