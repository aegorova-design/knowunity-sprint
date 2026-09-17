import { PlanScreen } from './PlanScreen';
import { PLAN_NOTHING_STARTED } from './planData';

/**
 * `?resume=` is the term a session was left on, put there by `06b Leave
 * session, confirm` when the student leaves mid-run. It is the only thing the
 * plan knows about a session in flight — the flow has no store, so what has
 * happened travels on the link (see `src/app/explain/href.ts`).
 *
 * With it, the Voice step goes to `05b Resume` instead of into the loop, which
 * is what SPEC.md's walkthrough asks for: "leave mid-session, then tap the
 * Voice step again. `/explain/resume` names which terms are done." Without it
 * nothing changes.
 */
function voiceHrefFor(resume: string | string[] | undefined): string {
  const from = Array.isArray(resume) ? resume[0] : resume;
  if (from) return `/explain/resume?from=${encodeURIComponent(from)}`;

  // First run: the voice step goes through the mic primer. After that it would
  // go straight to /explain/1 — see SPEC.md, screen 1.
  return '/explain/intro';
}

export default async function PlanPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { resume } = await searchParams;

  return <PlanScreen sections={PLAN_NOTHING_STARTED} voiceHref={voiceHrefFor(resume)} />;
}
