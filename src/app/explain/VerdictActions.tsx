/**
 * A verdict screen's thumb zone: the one Primary, an optional supporting
 * button under it, and the outcome line that says what the term recorded.
 *
 * `10 Got it` and `10b Got it, after a hint` both draw it, so by the rule in
 * `component-gaps.md` it stops being copied. `12b`, `13` and `13b` all draw
 * the same outcome line under their own buttons.
 *
 * The buttons are an `ActionStack` — the same Primary-with-something-under-it
 * this flow uses on every other screen with a thumb zone — so there is one
 * copy of that logic and one Space/200 gap, not two. This component adds the
 * caption and nothing else.
 *
 * The caption sits **Space/400** below the actions, which is what Mockups v2
 * draws on `10` and `13`: it is not an action, so it takes the wider step this
 * flow puts between a button stack and the content beside it — the same step
 * `08 Review` puts above its player. The buttons keep Space/200 among
 * themselves, inside the stack.
 *
 * It sits with the screens rather than in `src/components` for the same reason
 * `ActionStack` and `CoveredIdeas` do.
 */

import type { ReactNode } from 'react';

import { ActionStack } from './ActionStack';

import './verdictActions.css';

export function VerdictActions({
  primary,
  secondary,
  outcome,
}: {
  /** The screen's one main action — Next term, or See how you did. */
  primary: ReactNode;
  /** What supports it, if anything. `10b`'s Say it back; `10` has none. */
  secondary?: ReactNode;
  /**
   * What the term recorded, as the frames write it: `+15 XP · unaided`,
   * `+10 XP · hinted`, `revealed`. The word is what carries the result into
   * the summary; the number is SPEC.md's XP table.
   */
  outcome: string;
}) {
  return (
    <div className="verdictActions">
      <ActionStack primary={primary} below={secondary} />
      <p className="verdictActions-outcome">{outcome}</p>
    </div>
  );
}
