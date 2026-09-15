/**
 * buttonGroup — a primary and a supporting action shown together.
 *
 * Built from the Figma component set `buttonGroup` (node 13506:1226's main set)
 * in Yummy__Knowie Design Sprint. Prop names and options match the Figma
 * variant axes exactly: variant and size.
 *
 * Composed, not redrawn: the group is auto layout and nothing else. It sets the
 * direction, the gap and which child fills; the buttons inside it are `button`
 * and `buttonIcon` instances, exactly as Figma nests them. That is why the two
 * actions come in as slots rather than as label props — the emphasis of either
 * one can change without an override, the way design-system.md asks.
 *
 * The two variants are not the same shape:
 *
 * - **Vertical** stacks a full-width primary over a full-width secondary.
 * - **Horizontal** puts a square `buttonIcon` first and lets the primary fill
 *   the rest of the row.
 *
 * That difference is read off the file, not invented. See the Gaps note in the
 * stories: design-system.md describes Horizontal as two text buttons, which is
 * not what the component draws.
 */

import type { HTMLAttributes, ReactNode } from 'react';

import './buttonGroup.css';

/** Which way the two actions stack. */
export type ButtonGroupVariant = 'Horizontal' | 'Vertical';

/** Size of the controls inside. Matches the `size` on button and buttonIcon. */
export type ButtonGroupSize = 'M' | 'L';

export type ButtonGroupProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  /**
   * Vertical when either label could wrap after translation. Horizontal pairs
   * an icon button with the primary, so it carries only one label.
   */
  variant?: ButtonGroupVariant;
  /** Size of the controls inside. Pass the same size to the children. */
  size?: ButtonGroupSize;
  /**
   * The screen's one main action. Figma ships a Primary `button` here at the
   * group's size, filling the width in both variants.
   */
  primary?: ReactNode;
  /**
   * The supporting action. Figma ships a Secondary `button` on Vertical and a
   * Secondary `buttonIcon` on Horizontal, where it hugs its square.
   */
  secondary?: ReactNode;
};

export function ButtonGroup({
  variant = 'Vertical',
  size = 'M',
  primary,
  secondary,
  ...rest
}: ButtonGroupProps) {
  // Horizontal leads with the supporting icon button and puts the primary on
  // the right, which is the order the component draws. Vertical leads with the
  // primary. Order lives here rather than in CSS so the DOM and the reading
  // order match what is on screen.
  const children =
    variant === 'Horizontal' ? (
      <>
        {secondary ? <div className="knowieButtonGroup-hug">{secondary}</div> : null}
        {primary ? <div className="knowieButtonGroup-fill">{primary}</div> : null}
      </>
    ) : (
      <>
        {primary ? <div className="knowieButtonGroup-fill">{primary}</div> : null}
        {secondary ? <div className="knowieButtonGroup-fill">{secondary}</div> : null}
      </>
    );

  return (
    <div className="knowieButtonGroup" data-variant={variant} data-size={size} {...rest}>
      {children}
    </div>
  );
}
