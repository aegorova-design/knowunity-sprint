/**
 * iconSlot — every icon in the system goes through this.
 *
 * Built from the Figma component set `iconSlot` (node 9003:8809) in
 * Yummy__Knowie Design Sprint. The six variants are sizes bound to the Icon
 * token scale; Figma's single component property is an instance swap, which is
 * `children` here.
 *
 * Figma's own icon library — the 2392 components its swap draws from — is not
 * connected to the file and cannot be read. The repo carries its own set in
 * public/icons instead, and `icon` names one of those. Anything else still
 * goes in as `children`.
 */

import type { HTMLAttributes, ReactNode } from 'react';

import './iconSlot.css';

/** Matches the Figma variant values, which map onto Icon/100 … Icon/400. */
export type IconSlotSize = '100' | '150' | '200' | '250' | '300' | '400';

/**
 * One per file in public/icons, named the way the files are named. Figma
 * cannot offer this list: its icon library is unreachable. The repo has the
 * artwork; Figma does not.
 */
export type IconName =
  | 'ai-quiz'
  | 'arrow-left'
  | 'arrow-right'
  | 'arrow-right-alt'
  | 'check'
  | 'check-circle'
  | 'chevron-right'
  | 'circle-half'
  | 'corner-up-right'
  | 'dots-vertical'
  | 'eye'
  | 'graduation-hat-01'
  | 'help-circle'
  | 'keyboard-01'
  | 'lightbulb-02'
  | 'loading-01'
  | 'microphone-01'
  | 'myai-chat'
  | 'pause'
  | 'play'
  | 'refresh-ccw-01'
  | 'search-md'
  | 'share-02'
  | 'skip-forward'
  | 'stop'
  | 'target-04'
  | 'trophy-02'
  | 'x-close'
  | 'zap';

export type IconSlotProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
  /**
   * The size of the square, from the Icon token scale:
   * 100 = 8px, 150 = 12px, 200 = 16px, 250 = 20px, 300 = 24px, 400 = 32px.
   *
   * Figma names this axis `Size (IGNORE)`; the axis is real and token-bound, so
   * it is carried here as `size`. The Figma axis wants renaming to match.
   */
  size?: IconSlotSize;
  /**
   * Which icon from public/icons. Figma's instance-swap property. The artwork
   * takes the slot's colour, so set `color` on the slot to recolour it.
   */
  icon?: IconName;
  /**
   * An icon the set does not carry. Pass an element that fills its box and
   * paints with currentColor. Ignored when `icon` is set.
   */
  children?: ReactNode;
};

export function IconSlot({ size = '400', icon, children, ...rest }: IconSlotProps) {
  return (
    <span className="knowieIconSlot" data-size={size} data-icon={icon} {...rest}>
      {icon ? null : children}
    </span>
  );
}
