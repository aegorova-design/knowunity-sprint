/**
 * progressIndicator — step progress through a flow.
 *
 * Built from the Figma component set `progressIndicator` (node 9003:8923) in
 * Yummy__Knowie Design Sprint. Prop names and options match the Figma variant
 * axes: variant, thickness and progress.
 *
 * Figma's `showText` property and its "0/12" unit label are deliberately not
 * built — this project does not need them.
 *
 * Figma names five progress steps, 0 through 100 in quarters. Those five keep
 * working, but the bar is not limited to them: `progress` also takes any
 * number 0–100, and `current`/`total` compute one. A session of three terms
 * needs thirds, and a bar that can only draw quarters has to lie about where
 * the student is.
 */

import type { CSSProperties, HTMLAttributes } from 'react';

import './progressIndicator.css';

export type ProgressIndicatorVariant = 'Primary' | 'Coral';
export type ProgressIndicatorThickness = '24' | '16';
/** The five steps the Figma variants name. `progress` is not limited to them. */
export type ProgressIndicatorProgress = '0' | '25' | '50' | '75' | '100';

export type ProgressIndicatorProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'role'> & {
  /** Which accent the fill takes. */
  variant?: ProgressIndicatorVariant;
  /** Height of the track, from the Icon token scale: 24 = 24px, 16 = 16px. */
  thickness?: ProgressIndicatorThickness;
  /**
   * How far through the flow, 0–100. The five Figma quarters are the named
   * steps; any number in between works too. Ignored when `current` and
   * `total` are both given.
   */
  progress?: ProgressIndicatorProgress | number;
  /** Steps done so far. With `total`, computes `progress` — and the unit text. */
  current?: number;
  /** Steps in the whole flow. Needs `current`. */
  total?: number;
};

/** Anything outside 0–100 is a bug upstream; the bar draws what it can. */
function clamp(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

/**
 * Floor, not round, so a third reads as 33 and two thirds as 66 — the
 * fractions the student is actually at, never a step they have not reached.
 */
export function progressPercent(current: number, total: number) {
  if (!Number.isFinite(current) || !Number.isFinite(total) || total <= 0) return 0;
  return clamp(Math.floor((current / total) * 100));
}

export function ProgressIndicator({
  variant = 'Primary',
  thickness = '24',
  progress = '0',
  current,
  total,
  style,
  ...rest
}: ProgressIndicatorProps) {
  const counted = current !== undefined && total !== undefined;
  const value = counted ? progressPercent(current, total) : clamp(Number(progress));

  return (
    <div
      className="knowieProgressIndicator"
      data-variant={variant}
      data-thickness={thickness}
      data-progress={value}
      style={{ ...style, '--knowieProgress-pct': `${value}%` } as CSSProperties}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      // The unit text Figma keeps behind showText. Nothing draws it here, but
      // a screen reader reads it in place of the bare percentage, so it says
      // the thing the student counts in — terms, not percent.
      aria-valuetext={counted ? `${current} of ${total}` : undefined}
      // The bar carries no visible text of its own, so the screen it sits on
      // has to name it — pass aria-label or aria-labelledby.
      {...rest}
    >
      <div className="knowieProgressIndicator-fill" />
    </div>
  );
}
