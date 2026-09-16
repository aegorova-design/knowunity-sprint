/**
 * button — any action with a text label.
 *
 * Built from the Figma component set `button` (node 9003:6667) in
 * Yummy__Knowie Design Sprint. Prop names and their options match the Figma
 * variant axes and component properties exactly: variant, size, state,
 * showLeftIcon, showRightIcon and CTA.
 *
 * The markup is the anatomy the component's description sets out: an outer box
 * whose height never changes, and a face inside it that sinks on press. The lip
 * under the face, the sink and the timing all live in button.css, because the
 * movement is the whole press signal — no colour changes on press, on any
 * variant.
 */

import Link from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';

import { IconSlot, type IconName, type IconSlotSize } from '../icon-slot/IconSlot';

import './button.css';

export type ButtonVariant = 'Primary' | 'Secondary' | 'Tertiary';
export type ButtonSize = 'XS' | 'S' | 'M' | 'L';
export type ButtonState = 'Default' | 'Pressed' | 'Disabled' | 'Loading';

/**
 * Which step of the Icon scale each size puts in its slot — the same sizes the
 * reserved containers already held, so wiring the slot in changes no geometry.
 */
const SLOT_SIZE: Record<ButtonSize, IconSlotSize> = {
  XS: '200',
  S: '200',
  M: '250',
  L: '300',
};

export type ButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'disabled' | 'aria-busy'
> & {
  /** Emphasis. One Primary per screen; Secondary supports it; Tertiary is the lowest. */
  variant?: ButtonVariant;
  /** Size of the control. */
  size?: ButtonSize;
  /**
   * Visual state. Pressed, Disabled and Loading can be driven directly; a
   * Default button also sinks on :active, with the timing from the motion
   * tokens. Pressed is the still of that, for stories and specs.
   */
  state?: ButtonState;
  /** Reserves the left icon container. Matches the Figma boolean. */
  showLeftIcon?: boolean;
  /** Reserves the right icon container. Matches the Figma boolean. */
  showRightIcon?: boolean;
  /**
   * Which icon from public/icons sits in the left container. Figma's instance
   * swap, handed straight to iconSlot. Needs `showLeftIcon`; without an icon
   * the container still reserves its box, which is what it did before.
   */
  leftIcon?: IconName;
  /** The same, on the right. Needs `showRightIcon`. */
  rightIcon?: IconName;
  /** The button's label. Keep it to one or two words. */
  CTA?: string;
  /**
   * Where the action goes. With an href the control renders as a Next `Link`
   * carrying the same classes and data attributes, so it is a real anchor: it
   * prefetches, it opens in a new tab, and the page around it can stay a
   * Server Component instead of taking 'use client' just to push a route.
   *
   * Figma has no way to express this — a prototype whose buttons cannot
   * navigate is not a prototype, so it lives in code only. Without an href
   * nothing changes and this is still a `button`.
   *
   * `state="Disabled"` with an href renders a plain span: a disabled link is
   * not a thing, and an anchor with no href is not focusable anyway.
   */
  href?: string;
};

export function Button({
  variant = 'Primary',
  size = 'M',
  state = 'Default',
  showLeftIcon = false,
  showRightIcon = false,
  leftIcon,
  rightIcon,
  CTA = '1/2 words',
  href,
  type = 'button',
  onClick,
  ...rest
}: ButtonProps) {
  const isLoading = state === 'Loading';
  const isDisabled = state === 'Disabled';
  const slotSize = SLOT_SIZE[size];

  /**
   * The container either carries an icon or just holds its box. Decorative
   * either way: the label beside it is what names the action, so the icon is
   * never the only thing saying what the button does.
   *
   * No className is passed to IconSlot — it spreads its rest props after its
   * own className, so one given here would replace knowieIconSlot rather than
   * join it. The slot is coloured by descendant selector in button.css instead.
   */
  const iconBox = (icon: IconName | undefined) =>
    icon ? (
      <IconSlot size={slotSize} icon={icon} aria-hidden="true" />
    ) : (
      <span className="knowieButton-icon" aria-hidden="true" />
    );

  const face = (
    <span className="knowieButton-face">
      {showLeftIcon ? iconBox(leftIcon) : null}
      {/* Loading drops the label and shows the centre icon in its place, so
          the control shrinks the way the Figma Loading variants do. Like
          Disabled, it carries no lip, so it reads flat next to Default. */}
      {isLoading ? (
        <span className="knowieButton-icon" aria-hidden="true" />
      ) : (
        <span className="knowieButton-label">{CTA}</span>
      )}
      {showRightIcon ? iconBox(rightIcon) : null}
    </span>
  );

  /** The look is carried by the class and the data attributes, not the tag. */
  const skin = {
    className: 'knowieButton',
    'data-variant': variant,
    'data-size': size,
    'data-state': state,
  } as const;

  if (href !== undefined) {
    // rest is typed for a button because that is what this component usually
    // is. On the link path the same handful of props — id, style, aria-*,
    // data-* — belong to an anchor instead, so it is re-typed here rather
    // than splitting ButtonProps into a union the callers would have to know
    // about.
    const anchorRest = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
    const anchorClick = onClick as AnchorHTMLAttributes<HTMLAnchorElement>['onClick'];

    if (isDisabled) {
      return (
        <span {...skin} aria-disabled="true" {...anchorRest}>
          {face}
        </span>
      );
    }

    return (
      <Link
        href={href}
        {...skin}
        aria-busy={isLoading || undefined}
        aria-disabled={isLoading || undefined}
        aria-label={isLoading ? CTA : undefined}
        onClick={isLoading ? undefined : anchorClick}
        {...anchorRest}
      >
        {face}
      </Link>
    );
  }

  return (
    <button
      type={type}
      {...skin}
      disabled={isDisabled}
      // Loading stays focusable and keeps its name, so the press that started
      // the request is still announced while it is in flight.
      aria-busy={isLoading || undefined}
      aria-disabled={isLoading || undefined}
      aria-label={isLoading ? CTA : undefined}
      onClick={isLoading ? undefined : onClick}
      {...rest}
    >
      {face}
    </button>
  );
}
