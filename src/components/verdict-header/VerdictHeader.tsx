/**
 * verdictHeader — the top of a turn result.
 *
 * Built from the Figma component set `verdictHeader` (node 13584:6232) in
 * Yummy__Knowie Design Sprint. Prop names and options match the Figma
 * properties exactly: verdict, title and caption.
 *
 * Composed, not redrawn: Knowie is a mascotFigure at size L, which is how Figma
 * builds it — every variant nests the same instance and only swaps its pose.
 *
 * The title and caption are plain text here rather than a textBlock. See the
 * story docs: textBlock has no step at Headline M and no way to colour a title,
 * and Figma does not nest it either.
 */

import type { ElementType, HTMLAttributes } from 'react';

import { MascotFigure, type MascotFigurePose } from '../mascot-figure/MascotFigure';

import './verdictHeader.css';

/** The Figma `verdict` variant options, unchanged. Pass is Figma's default. */
export type VerdictHeaderVerdict = 'Pass' | 'Partial' | 'Miss' | 'Neutral' | 'Checking';

/**
 * The pose each verdict wears. Read off the variants: every one of the five
 * nests mascotFigure at size L and changes only this.
 *
 * Checking takes Thinking, the pose mascotFigure keeps outside mascotMessage's
 * four states for exactly this — Knowie working something out while the student
 * waits.
 */
const POSE: Record<VerdictHeaderVerdict, MascotFigurePose> = {
  Pass: 'Excited',
  Partial: 'Approving',
  Miss: 'Questioning',
  Neutral: 'Standby',
  Checking: 'Thinking',
};

export type VerdictHeaderProps = Omit<HTMLAttributes<HTMLDivElement>, 'title'> & {
  /**
   * Which result this is. Pass, Partial and Miss are the three verdicts;
   * Neutral and Checking are for review and processing.
   *
   * The verdict drives the pose and the title's colour together, so it is set
   * once here and never on the parts.
   */
  verdict?: VerdictHeaderVerdict;
  /** The headline. This is what actually says the verdict — see the docs. */
  title?: string;
  /** The line under it, explaining the result. Only rendered when showCaption is true. */
  caption?: string;
  /**
   * Whether the caption shows. Defaults to true, so every screen that already
   * uses the header is untouched.
   *
   * Figma has no property for this, unlike textBlock's own showCaption: the
   * frames switch the caption layer off on the instance instead, which is
   * something an instance can do and a component cannot express. `01 Home` is
   * the frame that does it — the exam line stands alone there. The component's
   * Figma description names the missing property as a gap; it is logged in
   * component-gaps.md too.
   */
  showCaption?: boolean;
  /**
   * Heading level for the title. Figma has no say in this, but the DOM does:
   * a result screen's headline is usually the screen's h1. Defaults to h2 so
   * the component is never a bare paragraph. Matches textBlock's `titleAs`.
   */
  titleAs?: Extract<ElementType, 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'>;
};

export function VerdictHeader({
  verdict = 'Pass',
  title = 'You got it',
  caption = 'Every key idea, first try, no help.',
  showCaption = true,
  titleAs: Title = 'h2',
  ...rest
}: VerdictHeaderProps) {
  return (
    <div className="knowieVerdictHeader" data-verdict={verdict} {...rest}>
      {/* Decorative: the title beside it already says the verdict, which is what
          mascotFigure's "never let a pose be the only thing carrying a verdict"
          rule requires. */}
      <MascotFigure size="L" pose={POSE[verdict]} />
      <Title className="knowieVerdictHeader-title">{title}</Title>
      {showCaption ? <p className="knowieVerdictHeader-caption">{caption}</p> : null}
    </div>
  );
}
