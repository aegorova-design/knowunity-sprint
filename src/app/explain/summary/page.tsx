/**
 * 17 Summary — `/explain/summary`. SPEC.md screen 26. One state, the end of a
 * session.
 *
 * Matches the Mockups v2 frame "17 Summary" (13662:14541).
 *
 * **The claim is the screen.** SPEC.md's whole reason for this feature is the
 * line at the top: the section is left carrying a count of terms explained
 * unaided. So the headline, the XP total and the three rows all read from one
 * table — `SESSION_OUTCOMES` in `script.ts` — and the total is summed rather
 * than printed, so the number at the top can never disagree with the rows
 * under it.
 *
 * **Every row leads to its own sheet**, `18 Summary, term tapped`. `termRow`
 * has no `href`, so the push happens in `SummaryRows`.
 *
 * The three slots live in `SummaryScreen.tsx`, because that sheet draws this
 * screen underneath itself rather than a second copy of it.
 */

import { Scaffold } from '@/components/scaffold/Scaffold';

import { SummaryActions, SummaryBar, SummaryContent } from './SummaryScreen';

export default function SummaryPage() {
  return (
    <Scaffold
      size="iPhone 13"
      topNavigation={<SummaryBar />}
      middleContent={<SummaryContent />}
      bottomContent={<SummaryActions />}
    />
  );
}
