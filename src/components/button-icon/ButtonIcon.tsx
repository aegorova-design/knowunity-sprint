/**
 * buttonIcon — an action shown as an icon alone: close, back, menu.
 *
 * Built from the Figma component set `buttonIcon` (node 9003:8235) in
 * Yummy__Knowie Design Sprint. Prop names and options match the Figma variant
 * axes exactly: variant, size and state.
 *
 * Structure mirrors Figma: a transparent tap-target wrapper (.knowieButtonIcon)
 * around the visible pill (.knowieButtonIcon-pill), the same shape the existing
 * button uses. The icon goes through iconSlot, as design-system.md requires.
 */

import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { IconSlot, type IconName, type IconSlotSize } from '../icon-slot/IconSlot';

import './buttonIcon.css';

export type ButtonIconVariant = 'Primary' | 'Secondary' | 'Tertiary' | 'Brand';
export type ButtonIconSize = 'S' | 'M' | 'L';
export type ButtonIconState = 'Default' | 'Pressed' | 'Disabled' | 'Loading';

/** Which step of the Icon scale each size puts in the slot. */
const SLOT_SIZE: Record<ButtonIconSize, IconSlotSize> = {
  S: '200',
  M: '250',
  L: '300',
};

export type ButtonIconProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'disabled' | 'aria-busy' | 'aria-label'
> & {
  /** Emphasis. Brand is the only one that carries the brand fill. */
  variant?: ButtonIconVariant;
  /** Size of the control. */
  size?: ButtonIconSize;
  /**
   * Visual state. Pressed, Disabled and Loading can be driven directly; a
   * Default button also picks up its own press styling on :active.
   */
  state?: ButtonIconState;
  /**
   * The accessible name. Required, not optional: design-system.md says "an
   * icon-only control needs an accessible label in code", and there is no
   * visible text here to fall back on.
   */
  label: string;
  /**
   * Which icon from public/icons. Figma's iconSlot instance swap, handed
   * straight to the slot. Use this whenever the set carries the icon; it is
   * replaced by the loading icon while state is Loading.
   */
  icon?: IconName;
  /**
   * An icon the set does not carry. Pass an element that fills its box and
   * paints with currentColor. Ignored when `icon` is set.
   */
  children?: ReactNode;
};

export function ButtonIcon({
  variant = 'Primary',
  size = 'S',
  state = 'Default',
  label,
  icon,
  children,
  type = 'button',
  onClick,
  ...rest
}: ButtonIconProps) {
  const isLoading = state === 'Loading';
  const isDisabled = state === 'Disabled';

  return (
    <button
      type={type}
      className="knowieButtonIcon"
      data-variant={variant}
      data-size={size}
      data-state={state}
      disabled={isDisabled}
      // Loading stays focusable and keeps its name, so the press that started
      // the request is still announced while it is in flight.
      aria-busy={isLoading || undefined}
      aria-disabled={isLoading || undefined}
      aria-label={label}
      onClick={isLoading ? undefined : onClick}
      {...rest}
    >
      <span className="knowieButtonIcon-pill">
        {/* No className passed to iconSlot: it spreads its rest props after its
            own className, so one given here would replace knowieIconSlot rather
            than join it. The slot is styled by descendant selector instead. */}
        {/* Loading swaps the icon for loading-01, the way the Figma Loading
            variants do, rather than laying a spinner over the icon. */}
        {isLoading ? (
          <IconSlot size={SLOT_SIZE[size]}>
            <span className="knowieButtonIcon-loading" aria-hidden="true" />
          </IconSlot>
        ) : (
          <IconSlot size={SLOT_SIZE[size]} icon={icon}>
            {children}
          </IconSlot>
        )}
      </span>
    </button>
  );
}
