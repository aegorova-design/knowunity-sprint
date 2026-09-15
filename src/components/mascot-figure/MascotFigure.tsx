/**
 * mascotFigure — Knowie, and only Knowie.
 *
 * Built from the Figma component set `mascotFigure` (node 13638:10184) in
 * Yummy__Knowie Design Sprint. Prop names and options match the Figma variant
 * axes exactly: size and pose.
 *
 * This supersedes mascotSlot for anything that needs Knowie at a real
 * proportion: mascotSlot is a square box that stretches the artwork, while this
 * follows the artwork's own 200:217 ratio, with height carrying the size token
 * and width following.
 *
 * Figma nests a private `.mascotFigureBase` inside each variant, which the
 * description says is never to be placed directly. It is not a second component
 * here; its pose swap is the `pose` prop.
 */

import type { HTMLAttributes } from 'react';

import './mascotFigure.css';

export type MascotFigureSize = 'S' | 'M' | 'L';

/** The five poses the set offers. A sixth is a product decision, not a variant. */
export type MascotFigurePose = 'Standby' | 'Excited' | 'Questioning' | 'Approving' | 'Thinking';

/** The file behind each pose. The numbers are the artwork's own ordering. */
const POSE_SRC: Record<MascotFigurePose, string> = {
  Standby: '/images/knowie-01-standby.svg',
  Excited: '/images/knowie-09-excited.svg',
  Questioning: '/images/knowie-11-questioning.svg',
  Approving: '/images/knowie-03-approving.svg',
  Thinking: '/images/knowie-12-thinking.svg',
};

export type MascotFigureProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
  /**
   * How much presence the moment needs. Height comes from the size token and
   * width follows the artwork's ratio: S = 48 tall, M = 64, L = 120.
   *
   * Never scale the artwork by hand.
   */
  size?: MascotFigureSize;
  /**
   * What Knowie is doing about it. Standby is neutral and the default,
   * Questioning belongs on a prompt, Approving on a pass, Excited on a summary
   * or a streak, Thinking on a moment where Knowie is working something out and
   * the student is waiting.
   *
   * Thinking is deliberately not one of mascotMessage's states — see its docs.
   */
  pose?: MascotFigurePose;
  /**
   * What Knowie is saying, for a screen reader. Empty by default: the pose must
   * never be the only thing carrying a verdict, so there is always copy beside
   * her that already says it. Give this a value only when Knowie is the whole
   * message.
   */
  alt?: string;
};

export function MascotFigure({
  size = 'S',
  pose = 'Standby',
  alt = '',
  ...rest
}: MascotFigureProps) {
  return (
    <span className="knowieMascotFigure" data-size={size} data-pose={pose} {...rest}>
      {/* Full-colour artwork, so it goes in as an image rather than through
          currentColor the way an icon does. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="knowieMascotFigure-pose" src={POSE_SRC[pose]} alt={alt} />
    </span>
  );
}
