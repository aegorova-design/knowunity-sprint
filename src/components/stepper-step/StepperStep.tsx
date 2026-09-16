/**
 * stepperStep — one step in a section's plan stepper.
 *
 * Built from the Figma component set `stepperStep` (node 13584:6336) in
 * Yummy__Knowie Design Sprint. Prop names and options match the Figma
 * properties exactly: type, state, label, caption and showCaption.
 *
 * The step icon goes through iconSlot at Size 250, the way Figma nests it and
 * the way design-system.md requires — "Every icon goes through iconSlot. Never
 * place a raw icon."
 */

import Link from 'next/link';
import type { AnchorHTMLAttributes, HTMLAttributes } from 'react';

import { IconSlot } from '../icon-slot/IconSlot';

import './stepperStep.css';

/** Learning bundles reading and quiz; Voice is the Explain out loud capstone. */
export type StepperStepType = 'Learning' | 'Voice';

/**
 * Matches the Figma variant values, which are PascalCase with no space. Every
 * one is a shape before it is a colour: Locked is a dashed ring, NotStarted a
 * solid empty ring, InProgress fills half the ring, Completed fills the ring
 * and the core.
 */
export type StepperStepState = 'Locked' | 'NotStarted' | 'InProgress' | 'Completed';

export type StepperStepProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  /** Which kind of step. Learning carries the quiz icon, Voice the mic. */
  type?: StepperStepType;
  /** How far along. Completed fills the ring and the core. */
  state?: StepperStepState;
  /** The step's name. */
  label?: string;
  /** The supporting line. Only rendered when showCaption is true. */
  caption?: string;
  /** Whether the caption shows. Matches the Figma boolean, which defaults to true. */
  showCaption?: boolean;
  /**
   * Where the step goes. With an href a non-Locked step renders as a Next
   * `Link` carrying the same classes and data attributes, so the whole row is
   * one focusable target with a focus ring and a pressed state.
   *
   * This is what the component's own description already claims — "Only Locked
   * is untappable" — and Locked keeps ignoring it, because a locked step is not
   * a target. Figma cannot express a destination, so it lives in code only.
   */
  href?: string;
};

export function StepperStep({
  type = 'Learning',
  state = 'NotStarted',
  label = 'Explain out loud',
  caption = 'Study and quiz',
  showCaption = true,
  href,
  ...rest
}: StepperStepProps) {
  // Locked ignores href. Everything else with one becomes a real link.
  const isLink = href !== undefined && state !== 'Locked';

  const body = (
    <>
      <div className="knowieStepperStep-step">
        {/* track is the unfilled ring and shows in every state — dashed on
            Locked. progress lays the brand ring over it: half of it on
            InProgress, all of it on Completed. */}
        <span className="knowieStepperStep-track" />
        {state === 'InProgress' || state === 'Completed' ? (
          <span className="knowieStepperStep-progress" />
        ) : null}
        <span className="knowieStepperStep-core" />
        {/* No className passed: iconSlot spreads its rest props after its own
            className, so one given here would replace knowieIconSlot rather
            than join it. The slot is styled by descendant selector instead. */}
        <IconSlot size="250">
          {/* The type picks the artwork in CSS, the way the Figma variant picks
              which icon the slot is swapped to. Decorative: the label beside it
              names the step. */}
          <span className="knowieStepperStep-glyph" aria-hidden="true" />
        </IconSlot>
      </div>
      <div className="knowieStepperStep-text">
        <p className="knowieStepperStep-label">{label}</p>
        {showCaption ? <p className="knowieStepperStep-caption">{caption}</p> : null}
      </div>
    </>
  );

  /** The look is carried by the class and the data attributes, not the tag. */
  const skin = {
    className: 'knowieStepperStep',
    'data-type': type,
    'data-state': state,
  } as const;

  if (isLink) {
    // rest is typed for a div because that is what this component usually is.
    // On the link path the same handful of props belong to an anchor instead.
    const anchorRest = rest as AnchorHTMLAttributes<HTMLAnchorElement>;

    return (
      <Link href={href} {...skin} data-interactive="true" {...anchorRest}>
        {body}
      </Link>
    );
  }

  return (
    <div {...skin} {...rest}>
      {body}
    </div>
  );
}
