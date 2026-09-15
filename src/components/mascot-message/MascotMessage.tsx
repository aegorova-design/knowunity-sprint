/**
 * mascotMessage — Knowie speaking to the student about their own recall.
 *
 * Built from the Figma component set `mascotMessage` (node 13641:15299) in
 * Yummy__Knowie Design Sprint. Prop names and options match the Figma
 * properties exactly: state, message, helper, showHelper and actionSlot.
 *
 * Composed, not redrawn: Knowie is a mascotFigure at size S, which is how Figma
 * nests her.
 */

import type { HTMLAttributes, ReactNode } from 'react';

import { MascotFigure, type MascotFigurePose } from '../mascot-figure/MascotFigure';

import './mascotMessage.css';

export type MascotMessageState = 'Default' | 'ToRevisit' | 'Mastered' | 'Relearn';

/**
 * The pose each state pulls.
 *
 * Set by the design owner, and it matches neither the Figma description nor the
 * variants exactly — both of those are now out of date. See the story docs for
 * what each said. All four poses are distinct here, which is the point.
 */
const POSE: Record<MascotMessageState, MascotFigurePose> = {
  Default: 'Standby',
  ToRevisit: 'Approving',
  Mastered: 'Excited',
  Relearn: 'Questioning',
};

export type MascotMessageProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  /** Which read on the section. Drives the message colour and Knowie's pose together. */
  state?: MascotMessageState;
  /** What Knowie says about this student's recall. */
  message?: string;
  /** The scheduling line — when Knowie brings these terms back. */
  helper?: string;
  /** Whether the helper shows. Matches the Figma boolean, which defaults to true. */
  showHelper?: boolean;
  /**
   * The call to action. Figma's instance swap, which ships a Primary XS button.
   * Pass the action rather than nesting a fixed one, so its emphasis can change
   * without an override.
   */
  actionSlot?: ReactNode;
};

export function MascotMessage({
  state = 'Default',
  // Figma's defaults, which are real copy rather than placeholders.
  message = 'Serfdom needed a nudge from me. Try it on your own in a couple of days.',
  helper = 'I will bring these three back on Thursday, two days before the exam.',
  showHelper = true,
  actionSlot,
  ...rest
}: MascotMessageProps) {
  return (
    <div className="knowieMascotMessage" data-state={state} {...rest}>
      {/* Decorative: the message beside her says it, which is what the pose
          rule in mascotFigure's description requires. */}
      <MascotFigure size="S" pose={POSE[state]} />
      <div className="knowieMascotMessage-bubble">
        <span className="knowieMascotMessage-tail" aria-hidden="true" />
        <p className="knowieMascotMessage-message">{message}</p>
        {showHelper ? <p className="knowieMascotMessage-helper">{helper}</p> : null}
        {actionSlot ? <div className="knowieMascotMessage-action">{actionSlot}</div> : null}
      </div>
    </div>
  );
}
