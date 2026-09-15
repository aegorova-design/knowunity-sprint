/**
 * appBar — top navigation inside the scaffold's topNavigation slot.
 *
 * Built from the Figma component set `appBar` (node 9003:8606) in
 * Yummy__Knowie Design Sprint. The `variant` prop carries the Figma variant
 * axis unchanged.
 *
 * Figma bakes its actions in as instances of two component sets — `App Bar
 * Button Icon` and `App Bar Button` — that have been deleted from the canvas
 * and survive only as orphans. Neither is built here, so the bar is a layout
 * shell: the variant decides the padding and which action regions exist, and
 * the actions themselves are passed in.
 */

import type { HTMLAttributes, ReactNode } from 'react';

import './appBar.css';

export type AppBarVariant =
  | 'default'
  | 'leftIconButtonOnly'
  | 'leftAndRightIconButton'
  | 'leftAndRightButton'
  | 'leftAndTwoRightIconButtons'
  | 'leftAnd2RightButtons';

export type AppBarProps = Omit<HTMLAttributes<HTMLElement>, 'children'> & {
  /** Which arrangement of actions the bar carries. */
  variant?: AppBarVariant;
  /**
   * The centre slot. design-system.md puts a progressIndicator here on flow
   * screens; Figma's slot property is named `Slot`.
   */
  Slot?: ReactNode;
  /** The leading action — a back or close. Absent on `default`. */
  left?: ReactNode;
  /**
   * The trailing action or actions. Absent on `default` and
   * `leftIconButtonOnly`; the two-action variants take both here.
   */
  right?: ReactNode;
};

/** Which regions each Figma variant draws. */
const HAS_LEFT: Record<AppBarVariant, boolean> = {
  default: false,
  leftIconButtonOnly: true,
  leftAndRightIconButton: true,
  leftAndRightButton: true,
  leftAndTwoRightIconButtons: true,
  leftAnd2RightButtons: true,
};

const HAS_RIGHT: Record<AppBarVariant, boolean> = {
  default: false,
  leftIconButtonOnly: false,
  leftAndRightIconButton: true,
  leftAndRightButton: true,
  leftAndTwoRightIconButtons: true,
  leftAnd2RightButtons: true,
};

export function AppBar({ variant = 'default', Slot, left, right, ...rest }: AppBarProps) {
  return (
    <header className="knowieAppBar" data-variant={variant} {...rest}>
      {HAS_LEFT[variant] ? <div className="knowieAppBar-left">{left}</div> : null}
      <div className="knowieAppBar-slot">{Slot}</div>
      {HAS_RIGHT[variant] ? <div className="knowieAppBar-right">{right}</div> : null}
    </header>
  );
}
