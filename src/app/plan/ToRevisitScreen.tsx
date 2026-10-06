'use client';

/**
 * `19 Plan`'s screen with its result read from the session rather than
 * written into `planData.ts`: the unaided count on the section header, and
 * Knowie's line naming which terms needed what.
 *
 * Built from the script in demo mode, it produces the scripted copy exactly —
 * "1 of 3 on your own", "Mammal needed a hint. Hibernation was revealed." —
 * so there is one path, not two. Until the outcomes can be read (the server
 * render, and the first client render of a hard load) the section shows no
 * result, rather than a line about to change.
 */

import { planMessage, unaidedCount, useLatestOutcomes } from '../explain/outcomes';
import { TERM_COUNT } from '../explain/session';
import { PlanScreen, type PlanScreenProps } from './PlanScreen';
import { PLAN_TO_REVISIT } from './planData';
import { BubbleActions } from './PlanBubbleActions';

export function ToRevisitScreen(props: Omit<PlanScreenProps, 'sections'>) {
  // The latest result for each term across sessions — the same view the
  // review shows, so the two counts always agree.
  const outcomes = useLatestOutcomes();
  const [section, ...rest] = PLAN_TO_REVISIT;

  const withResult =
    outcomes && section.result
      ? {
          ...section,
          result: {
            ...section.result,
            status: `${unaidedCount(outcomes)} of ${TERM_COUNT} on your own`,
            message: { ...section.result.message, message: planMessage(outcomes) },
          },
        }
      : { ...section, result: undefined };

  return (
    <PlanScreen
      {...props}
      sections={[withResult, ...rest]}
      resultActions={<BubbleActions section="toRevisit" />}
    />
  );
}
