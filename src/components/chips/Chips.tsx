/**
 * chips — selectable options: topics, filters, tool entry points.
 *
 * Built from the Figma component set `chips` (node 9003:8679) in
 * Yummy__Knowie Design Sprint. Prop names and options match the Figma
 * properties exactly, including the ones design-system.md already flags as
 * off-convention: the set is plural where everything else is singular, the
 * text property is `Text` with a capital T, and `active` is a variant with
 * the string values "False" and "True" rather than a boolean.
 *
 * The icons go through iconSlot, as design-system.md requires.
 */

import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { IconSlot, type IconSlotSize } from '../icon-slot/IconSlot';

import './chips.css';

export type ChipsSize = 'XXS' | 'XS' | 'S' | 'M';
export type ChipsColor = 'Primary' | 'pro';
/** Figma's variant values, which are strings rather than a boolean. */
export type ChipsActive = 'False' | 'True';

/** Which step of the Icon scale each size puts in its slots. */
const SLOT_SIZE: Record<ChipsSize, IconSlotSize> = {
  XXS: '150',
  XS: '150',
  S: '200',
  M: '250',
};

export type ChipsProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  /** Size of the chip. */
  size?: ChipsSize;
  /** Use pro only for PRO content. */
  color?: ChipsColor;
  /** Whether the option is selected. */
  active?: ChipsActive;
  /** Whether the leading icon shows. Matches the Figma boolean, which defaults to true. */
  showLeftIcon?: boolean;
  /** Whether the trailing icon shows. Matches the Figma boolean, which defaults to true. */
  showRightIcon?: boolean;
  /** The chip's label. Keep it to one or two words. */
  Text?: string;
  /** The leading icon. Pass an element that fills its box and paints with currentColor. */
  leftIcon?: ReactNode;
  /** The trailing icon. Pass an element that fills its box and paints with currentColor. */
  rightIcon?: ReactNode;
};

export function Chips({
  size = 'XXS',
  color = 'Primary',
  active = 'False',
  showLeftIcon = true,
  showRightIcon = true,
  Text = '1/2 words',
  leftIcon,
  rightIcon,
  type = 'button',
  ...rest
}: ChipsProps) {
  return (
    <button
      type={type}
      className="knowieChips"
      data-size={size}
      data-color={color}
      data-active={active}
      // active marks the selected state, which is what aria-pressed says.
      aria-pressed={active === 'True'}
      {...rest}
    >
      {/* No className passed to iconSlot: it spreads its rest props after its
          own className, so one given here would replace knowieIconSlot rather
          than join it. The slots are styled by descendant selector instead. */}
      {showLeftIcon ? <IconSlot size={SLOT_SIZE[size]}>{leftIcon}</IconSlot> : null}
      <span className="knowieChips-label">{Text}</span>
      {showRightIcon ? <IconSlot size={SLOT_SIZE[size]}>{rightIcon}</IconSlot> : null}
    </button>
  );
}
