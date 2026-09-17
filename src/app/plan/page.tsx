/**
 * 02 Plan, nothing started — `/plan`. SPEC.md screen 1.
 *
 * The entry stage, and the only one `01 Home` leads to. Every other way back
 * to the plan names a later stage instead — see `planHref.ts`.
 */

import { PlanScreen } from './PlanScreen';
import { PLAN_IN_PROGRESS_HREF, voiceHrefFor } from './planHref';
import { PLAN_NOTHING_STARTED } from './planData';

export default async function PlanPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { resume } = await searchParams;

  return (
    <PlanScreen
      sections={PLAN_NOTHING_STARTED}
      /* First run: the voice step goes through the mic primer. After that it
         would go straight to /explain/1 — see SPEC.md, screen 1. */
      voiceHref={voiceHrefFor(resume, '/explain/intro')}
      /* Section 1's three learning steps go to `03 Plan, section 1 in
         progress`. This screen is the only one that passes it — see the prop.
         Study and quiz is out of scope, so a tap moves the section along
         rather than opening it, which is what connects the two frames. */
      learningHref={PLAN_IN_PROGRESS_HREF}
    />
  );
}
