/**
 * 19 Plan, 2 of 3 unaided — `/plan/to-revisit`. SPEC.md screen 5. One state,
 * where a session that needed help leaves the section.
 *
 * Matches the Mockups v2 frame "19 Plan, 2 of 3 unaided" (13662:14553).
 *
 * **This is the screen the feature exists for.** The section is left carrying
 * a count of terms explained unaided, and Knowie names the date the ones that
 * needed help come back — which is what pulls the student back before the
 * exam. So the status line and the scheduling line are the two things on it
 * that matter, and `showHelper` is forced on in `PlanScreen` for that reason.
 *
 * Both ways forward go to `/explain/1`: the Voice step redoes the section, and
 * "Do it now anyway" starts the same loop over the terms Knowie just named
 * rather than waiting for Thursday. Neither is a first run, so neither goes
 * back through the primer.
 */

import { PlanScreen } from '../PlanScreen';
import { PLAN_TO_REVISIT } from '../planData';

export default function PlanToRevisitPage() {
  return <PlanScreen sections={PLAN_TO_REVISIT} voiceHref="/explain/1" />;
}
