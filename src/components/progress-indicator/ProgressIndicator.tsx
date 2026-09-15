/**
 * progressIndicator — step progress through a flow.
 *
 * Built from the Figma component set `progressIndicator` (node 9003:8923) in
 * Yummy__Knowie Design Sprint. Prop names and options match the Figma variant
 * axes: variant, thickness and progress.
 *
 * Figma's `showText` property and its "0/12" unit label are deliberately not
 * built — this project does not need them.
 */

import type { HTMLAttributes } from 'react';

import './progressIndicator.css';

export type ProgressIndicatorVariant = 'Primary' | 'Coral';
export type ProgressIndicatorThickness = '24' | '16';
export type ProgressIndicatorProgress = '0' | '25' | '50' | '75' | '100';

export type ProgressIndicatorProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'role'> & {
  /** Which accent the fill takes. */
  variant?: ProgressIndicatorVariant;
  /** Height of the track, from the Icon token scale: 24 = 24px, 16 = 16px. */
  thickness?: ProgressIndicatorThickness;
  /** How far through the flow, in quarters, matching the Figma variants. */
  progress?: ProgressIndicatorProgress;
};

export function ProgressIndicator({
  variant = 'Primary',
  thickness = '24',
  progress = '0',
  ...rest
}: ProgressIndicatorProps) {
  return (
    <div
      className="knowieProgressIndicator"
      data-variant={variant}
      data-thickness={thickness}
      data-progress={progress}
      role="progressbar"
      aria-valuenow={Number(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      // The bar carries no text of its own, so the screen it sits on has to
      // name it — pass aria-label or aria-labelledby.
      {...rest}
    >
      <div className="knowieProgressIndicator-fill" />
    </div>
  );
}
