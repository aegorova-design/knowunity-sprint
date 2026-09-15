/**
 * statusTag — one term's outcome as a label.
 *
 * Built from the Figma component set `statusTag` (node 13610:9718) in
 * Yummy__Knowie Design Sprint. `variant` carries the Figma variant axis
 * unchanged, and it is the component's only property.
 *
 * There is deliberately no label prop: Figma holds the label as a fixed text
 * layer, not a text property, so an instance cannot be made to say something
 * its variant does not. A fifth outcome is a new variant and a decision.
 */

import type { HTMLAttributes } from 'react';

import './statusTag.css';

export type StatusTagVariant = 'Unaided' | 'Hinted' | 'Revealed' | 'Skipped';

export type StatusTagProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
  /** Which of the four term outcomes this tag names. */
  variant?: StatusTagVariant;
};

/** The label each variant carries, fixed the way Figma fixes it. */
const LABEL: Record<StatusTagVariant, string> = {
  Unaided: 'Unaided',
  Hinted: 'Hinted',
  Revealed: 'Revealed',
  Skipped: 'Skipped',
};

export function StatusTag({ variant = 'Unaided', ...rest }: StatusTagProps) {
  return (
    <span className="knowieStatusTag" data-variant={variant} {...rest}>
      {LABEL[variant]}
    </span>
  );
}
