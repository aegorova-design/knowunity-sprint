/**
 * 21 Plan, section mastered — `/plan/mastered`. SPEC.md screen 6. One state,
 * where a session with nothing left to schedule leaves the section.
 *
 * Matches the Mockups v2 frame "21 Plan, section mastered" (13662:14554).
 *
 * `SectionHeader` reports the **latest session**, so this can regress to
 * ToRevisit if a later run goes worse — and a section can reach it without
 * ever being read, which SPEC.md accepts under "Known trade-off, accepted".
 * Do not re-gate the Voice step to protect the claim.
 *
 * Both ways forward go to `/explain/1`, as on `/plan/to-revisit`: the Voice
 * step redoes the section, and "Practice sooner" runs the same loop now rather
 * than on the date Knowie named.
 */

import { PlanScreen } from '../PlanScreen';
import { PLAN_MASTERED } from '../planData';
import { PLAN_MASTERED_HREF } from '../planHref';

export default function PlanMasteredPage() {
  return (
    <PlanScreen
      sections={PLAN_MASTERED}
      voiceHref="/explain/1"
      planHref={PLAN_MASTERED_HREF}
      /* Home stays `01 Home`, which is the one remaining way back to `02`.
         There is no "home, all done" frame, and `20 Home, revisit` still
         claims a term is due — untrue once the section is mastered. It
         doubles as the reset for the next run through. */
    />
  );
}
