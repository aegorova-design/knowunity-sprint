/**
 * recordButton — the mic for Explain out loud.
 *
 * Built from the Figma component set `recordButton` (node 13584:6055) in
 * Yummy__Knowie Design Sprint. Prop names and options match the Figma variant
 * axes exactly: variant and state.
 *
 * The icon goes through iconSlot at Size 400, the way Figma nests it.
 */

import type { ButtonHTMLAttributes } from 'react';

import { IconSlot } from '../icon-slot/IconSlot';

import './recordButton.css';

export type RecordButtonVariant = 'Idle' | 'Recording';
export type RecordButtonState = 'Default' | 'Pressed' | 'Disabled';

type BaseProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'disabled' | 'aria-label'
> & {
  /**
   * The accessible name — "Start recording", "Stop recording". Required: this
   * is an icon-only control, so there is no visible text to fall back on.
   */
  label: string;
};

/**
 * Idle takes all three states; Recording takes Default and Pressed only.
 *
 * That is not a gap in the file — Figma has 5 variants, not 6, because a live
 * recording cannot be disabled mid-take. Encoding it as a union means the
 * combination that does not exist cannot be written.
 */
export type RecordButtonProps = BaseProps &
  (
    | { variant?: 'Idle'; state?: RecordButtonState }
    | { variant: 'Recording'; state?: 'Default' | 'Pressed' }
  );

export function RecordButton({
  variant = 'Idle',
  state = 'Default',
  label,
  type = 'button',
  onClick,
  ...rest
}: RecordButtonProps) {
  const isDisabled = state === 'Disabled';

  return (
    <button
      type={type}
      className="knowieRecordButton"
      data-variant={variant}
      data-state={state}
      disabled={isDisabled}
      aria-label={label}
      onClick={isDisabled ? undefined : onClick}
      {...rest}
    >
      {/* No className passed to iconSlot: it spreads its rest props after its
          own className, so one given here would replace knowieIconSlot rather
          than join it. The slot is styled by descendant selector instead. */}
      <IconSlot size="400">
        {/* The variant picks the artwork in CSS, the way the Figma variant picks
            which icon the slot is swapped to. */}
        <span className="knowieRecordButton-glyph" aria-hidden="true" />
      </IconSlot>
    </button>
  );
}
