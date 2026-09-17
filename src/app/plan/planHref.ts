/**
 * Where the plan's routes are, and what its Voice step points at.
 *
 * **The plan has four stages and each is its own route.** Nothing is stored:
 * `02` through `21` are pure functions of their URL, the way `href.ts`
 * describes for the session. What makes the flow feel like progress is that
 * every way *back* to the plan names the stage the student has reached rather
 * than always `/plan` — see `PlanScreen`'s `planHref`. Reload any of them and
 * you get that stage again, and a second student starting at `/` gets `02`,
 * because there is nothing to reset.
 */

/** `02 Plan, nothing started` — the entry stage, and where `01 Home` leads. */
export const PLAN_HREF = '/plan';

/** `03 Plan, section 1 in progress` — a session has been started. */
export const PLAN_IN_PROGRESS_HREF = '/plan/in-progress';

/** `19 Plan, 1 of 3 unaided` — a session is behind the student. */
export const PLAN_TO_REVISIT_HREF = '/plan/to-revisit';

/** `21 Plan, section mastered` — the terms have all come back. */
export const PLAN_MASTERED_HREF = '/plan/mastered';

/**
 * Where the Voice step goes.
 *
 * `?resume=` is the term a session was left on, put there by `06b Leave
 * session, confirm`. It is the only thing the plan knows about a session in
 * flight — the flow has no store, so what has happened travels on the link
 * (see `src/app/explain/href.ts`).
 *
 * With it, the Voice step goes to `05b Resume` instead of into the loop, which
 * is what SPEC.md's walkthrough asks for: "leave mid-session, then tap the
 * Voice step again. `/explain/resume` names which terms are done." Without it
 * the caller's own destination stands — the primer on `02`, which is the only
 * first run, and straight into the loop everywhere after.
 */
export function voiceHrefFor(
  resume: string | string[] | undefined,
  fallback: string,
): string {
  const from = Array.isArray(resume) ? resume[0] : resume;
  if (from) return `/explain/resume?from=${encodeURIComponent(from)}`;

  return fallback;
}

/**
 * The plan stages a link can name, as `?plan=` on `01 Home`.
 *
 * Home is the one screen in the flow with no place in the story: `01` is the
 * entry, and it is also where the home tab lands from every plan stage. So the
 * stage travels with the student and comes back on Continue studying, the same
 * way `?resume=` carries a session in flight. Without it — a typed `/`, or a
 * reload — home is the entry it was, and Continue studying goes to `02`. That
 * is the reset between runs.
 */
const PLAN_STAGES: Record<string, string> = {
  'in-progress': PLAN_IN_PROGRESS_HREF,
  'to-revisit': PLAN_TO_REVISIT_HREF,
  mastered: PLAN_MASTERED_HREF,
};

/** `01 Home` carrying the stage the student is on, for the home tab. */
export function homeHrefFor(stage: keyof typeof PLAN_STAGES | string): string {
  return `/?plan=${stage}`;
}

/** What `01 Home` sends Continue studying and its plan tab to. */
export function planHrefFrom(raw: string | string[] | undefined): string {
  const stage = Array.isArray(raw) ? raw[0] : raw;

  return (stage && PLAN_STAGES[stage]) || PLAN_HREF;
}
