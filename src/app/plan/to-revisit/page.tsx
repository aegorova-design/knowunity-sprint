/**
 * 19 Plan, 1 of 3 unaided — `/plan/to-revisit`. SPEC.md screen 5. One state,
 * where a session that needed help leaves the section.
 *
 * Matches the Mockups v2 frame "19 Plan, 1 of 3 unaided" (13662:14553).
 *
 * **This is the screen the feature exists for.** The section is left carrying
 * a count of terms explained unaided, and Knowie names the date the ones that
 * needed help come back — which is what pulls the student back before the
 * exam. So the status line and the scheduling line are the two things on it
 * that matter, and `showHelper` is forced on in `PlanScreen` for that reason.
 *
 * The Voice step redoes the section at `/explain/1`. Not a first run, so it
 * does not go back through the primer.
 *
 * **Home goes to `20 Home, revisit`, not `01 Home`.** The first session is
 * behind the student and the terms Knowie named are pending, so the home they
 * return to is the one that says a term is due. This is the only route into
 * `/home/revisit` in the whole flow, and so the only way `21 Plan, section
 * mastered` is reachable by clicking.
 *
 * **"Do it now anyway" is stubbed for the stakeholder walkthrough.** It goes
 * straight to `20b Revisit complete` and skips the session that earns it. The
 * real path runs the recall loop first — the button means "practise these now
 * rather than on the date Knowie named", and `20b` is where that lands once
 * the term comes back unaided. A second pass of the loop is not built this
 * sprint, so the click-through jumps the middle.
 */

import { PlanScreen } from '../PlanScreen';
import { PLAN_TO_REVISIT } from '../planData';
import { PLAN_TO_REVISIT_HREF } from '../planHref';

export default function PlanToRevisitPage() {
  return (
    <PlanScreen
      sections={PLAN_TO_REVISIT}
      voiceHref="/explain/1"
      homeHref="/home/revisit"
      planHref={PLAN_TO_REVISIT_HREF}
      /* Stubbed: straight to 20b, skipping the loop. See the note above. */
      resultActionHref="/explain/revisit-done"
    />
  );
}
