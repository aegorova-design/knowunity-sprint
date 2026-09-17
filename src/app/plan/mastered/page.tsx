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

export default function PlanMasteredPage() {
  return <PlanScreen sections={PLAN_MASTERED} voiceHref="/explain/1" />;
}
