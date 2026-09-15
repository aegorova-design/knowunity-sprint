/**
 * textField — the multiline answer input for the typed fallback.
 *
 * Built from the Figma component set `textField` (node 13584:6294) in
 * Yummy__Knowie Design Sprint. Prop names and options match the Figma
 * properties exactly: state and value.
 *
 * This closes the first gap in design-system.md's "Gaps waiting for a
 * decision" list — "textField. A typed answer is the way out when a student
 * can't speak. Nothing local covers it." That entry can go now.
 */

import type { TextareaHTMLAttributes } from 'react';

import './textField.css';

export type TextFieldState = 'Empty' | 'Filled';

export type TextFieldProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'children' | 'aria-label'
> & {
  /** Whether the field is showing its placeholder or something the student typed. */
  state?: TextFieldState;
  /** What the student typed. */
  value?: string;
  /**
   * The accessible name — "Your explanation". Required: the field carries no
   * visible label of its own, and a textarea a screen reader announces as
   * nothing is unusable.
   */
  label: string;
};

export function TextField({
  state = 'Empty',
  value,
  label,
  // Figma's default for the same text layer, which reads as the prompt when the
  // field is empty and as the answer once it is filled.
  placeholder = 'Type your explanation',
  ...rest
}: TextFieldProps) {
  return (
    <textarea
      className="knowieTextField"
      data-state={state}
      value={value}
      placeholder={placeholder}
      aria-label={label}
      {...rest}
    />
  );
}
