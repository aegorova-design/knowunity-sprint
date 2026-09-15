/**
 * termRow — one term's outcome on the session summary.
 *
 * Built from the Figma component set `termRow` (node 13584:6289) in
 * Yummy__Knowie Design Sprint. `variant`, `state`, `term` and `xp` carry the
 * Figma properties unchanged.
 *
 * The whole row is the tap target, so it is a button with a 64 minimum height
 * and a Pressed state.
 *
 * Composed from statusTag and iconSlot, as Figma composes it. The row's
 * variant drives the badge and the nested tag together — the outcome is set
 * once, here, and never on the tag inside.
 */

import type { ButtonHTMLAttributes } from 'react';

import { IconSlot, type IconName } from '../icon-slot/IconSlot';
import { StatusTag } from '../status-tag/StatusTag';
import './termRow.css';

export type TermRowVariant = 'Unaided' | 'Hinted' | 'Revealed' | 'Skipped';
export type TermRowState = 'Default' | 'Pressed';

export type TermRowProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'type'
> & {
  /** Which of the four term outcomes this row reports. */
  variant?: TermRowVariant;
  /** Visual state. A Default row also picks up its press styling on :active. */
  state?: TermRowState;
  /** The term itself. */
  term?: string;
  /** What the term earned. */
  xp?: string;
};

/** The badge icon each outcome carries, as Figma swaps them. */
const BADGE_ICON: Record<TermRowVariant, IconName> = {
  Unaided: 'check',
  Hinted: 'circle-half',
  Revealed: 'eye',
  Skipped: 'skip-forward',
};

export function TermRow({
  variant = 'Unaided',
  state = 'Default',
  term = 'Feudalism',
  xp = '+10 XP',
  ...rest
}: TermRowProps) {
  return (
    <button type="button" className="knowieTermRow" data-variant={variant} data-state={state} {...rest}>
      <span className="knowieTermRow-badge">
        <IconSlot size="250" icon={BADGE_ICON[variant]} />
      </span>
      <span className="knowieTermRow-term">{term}</span>
      <span className="knowieTermRow-xp">{xp}</span>
      <StatusTag variant={variant} />
      <span className="knowieTermRow-chevron">
        <IconSlot size="250" icon="chevron-right" />
      </span>
    </button>
  );
}
