/**
 * 03 Plan, section 1 in progress — `/plan/in-progress`. SPEC.md screen 2.
 *
 * The stage a started session leaves the plan on, which is why `06b Leave
 * session, confirm` returns here rather than to `02`: a session has begun, so
 * the plan that says nothing has started would undo what the student just did.
 * It therefore reads `?resume=` the way `/plan` does — see `planHref.ts`.
 */

import { PlanScreen } from '../PlanScreen';
import { PLAN_IN_PROGRESS_HREF, voiceHrefFor } from '../planHref';
import { PLAN_IN_PROGRESS } from '../planData';

export default async function PlanInProgressPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { resume } = await searchParams;

  return (
    <PlanScreen
      sections={PLAN_IN_PROGRESS}
      // Not a first run: section 1 is already underway, so the voice step goes
      // straight to the loop rather than back through the primer — SPEC.md,
      // screen 1, "on a first run, /explain/1 after that".
      voiceHref={voiceHrefFor(resume, '/explain/1')}
      planHref={PLAN_IN_PROGRESS_HREF}
    />
  );
}
