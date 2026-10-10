'use client';

/**
 * What Knowie's bubble on the plan offers once a section has a result. It reads
 * what the session store knows, so it is client-side, and it does not offer
 * the review until a session has reached its summary.
 *
 * By state, through `mascotMessage`'s `actionsSlot`, all Tertiary XS in one
 * row as the `mascotMessage` frame draws them, the practice action first:
 * - session done, revisit not yet due — Review answers;
 * - revisit due (terms still need help and the interval has passed; in demo
 *   mode, after the time skip on `20 Home, revisit`) — Practice again, then
 *   Review answers;
 * - mastered — Practice sooner, then Review answers.
 */

import { Button } from '@/components/button/Button';
import { StepperStep, type StepperStepState } from '@/components/stepper-step/StepperStep';

import { useIsDemoMode } from '../explain/demoMode';
import { NEW_SESSION_HREF } from '../explain/inputMode';
import { useHasCompletedSession, usePlanPreview, useRevisitDue } from '../explain/outcomes';
import { REVIEW_HREF } from '../explain/summary/SummaryScreen';
import { PLAN_MASTERED_HREF, PLAN_TO_REVISIT_HREF, notYetHref } from './planHref';

/**
 * Where Practice again starts the revisit. Demo mode's revisit is the stub,
 * `20b Revisit complete`. Real mode has no revisit session yet, so it runs
 * the section again as a new session, whose results become the latest.
 */
const DEMO_REVISIT_HREF = '/explain/revisit-done';

function ReviewAnswers() {
  return <Button variant="Tertiary" size="XS" CTA="Review answers" href={REVIEW_HREF} />;
}

function Practice({ label, href }: { label: string; href: string }) {
  return (
    <Button variant="Tertiary" size="XS" CTA={label} showLeftIcon leftIcon="microphone-01" href={href} />
  );
}

export function BubbleActions({ section }: { section: 'toRevisit' | 'mastered' }) {
  const isDemo = useIsDemoMode();
  const completed = useHasCompletedSession();
  const revisitDue = useRevisitDue();
  // A facilitator's plan-state preview starts no session: practice goes to the
  // "not in the prototype yet" screen, which comes back to this plan.
  const preview = usePlanPreview();
  const stub = notYetHref(section === 'mastered' ? PLAN_MASTERED_HREF : PLAN_TO_REVISIT_HREF);

  if (section === 'mastered') {
    return (
      <>
        <Practice label="Practice sooner" href={preview ? stub : NEW_SESSION_HREF} />
        {completed ? <ReviewAnswers /> : null}
      </>
    );
  }

  if (!completed) return null;

  if (!revisitDue) return <ReviewAnswers />;

  return (
    <>
      <Practice
        label="Practice again"
        href={preview ? stub : isDemo ? DEMO_REVISIT_HREF : NEW_SESSION_HREF}
      />
      <ReviewAnswers />
    </>
  );
}

/**
 * The Explain out loud step. It starts a new session — except in a plan-state
 * preview, where it goes to the "not in the prototype yet" screen instead.
 */
export function VoiceStep({
  state,
  label,
  caption,
  href,
  planHref,
}: {
  state: StepperStepState;
  label: string;
  caption: string;
  href: string;
  /** This plan, for the stub's Back. */
  planHref: string;
}) {
  const preview = usePlanPreview();
  return (
    <StepperStep
      type="Voice"
      state={state}
      label={label}
      caption={caption}
      href={preview ? notYetHref(planHref) : href}
    />
  );
}
