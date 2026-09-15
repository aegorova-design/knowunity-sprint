/**
 * takePlayer — a recorded answer the student can listen back to.
 *
 * Built from the Figma component set `takePlayer` (node 13584:6181) in
 * Yummy__Knowie Design Sprint. Prop names and options match the Figma
 * properties exactly: state, surface and duration.
 *
 * Composed, not redrawn: the control is a buttonIcon and the levels are a
 * waveform, which is how Figma nests them. The state drives all three parts at
 * once, so the button, the bars and the fill can never disagree.
 */

import type { HTMLAttributes } from 'react';

import { ButtonIcon, type ButtonIconVariant } from '../button-icon/ButtonIcon';
import { Waveform, type WaveformProgress, type WaveformState } from '../waveform/Waveform';

import './takePlayer.css';

export type TakePlayerState = 'Default' | 'Playing' | 'Silent';
export type TakePlayerSurface = 'Page' | 'Sheet';

/**
 * What each state drives. One place to set the meaning, the way termRow's
 * variant drives its badge and its nested statusTag together.
 */
const BY_STATE: Record<
  TakePlayerState,
  {
    variant: ButtonIconVariant;
    label: string;
    waveform: WaveformState;
    progress: WaveformProgress;
  }
> = {
  Default: { variant: 'Primary', label: 'Play', waveform: 'Idle', progress: '0' },
  Playing: { variant: 'Brand', label: 'Pause', waveform: 'Idle', progress: '50' },
  Silent: { variant: 'Primary', label: 'Play', waveform: 'Silent', progress: '0' },
};

export type TakePlayerProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  /** Default is a take at rest, Playing is it running, Silent is a take with no audio. */
  state?: TakePlayerState;
  /** What it sits on. Use Sheet inside bottomSheetOnly so it stays distinct from the sheet. */
  surface?: TakePlayerSurface;
  /** How long the take is. */
  duration?: string;
  /**
   * Called when the play control is pressed. Figma has no property for this —
   * a player whose button does nothing is not a player.
   */
  onPlayPause?: () => void;
};

export function TakePlayer({
  state = 'Default',
  surface = 'Page',
  duration = '0:14',
  onPlayPause,
  ...rest
}: TakePlayerProps) {
  const spec = BY_STATE[state];

  return (
    <div className="knowieTakePlayer" data-state={state} data-surface={surface} {...rest}>
      <ButtonIcon variant={spec.variant} size="M" label={spec.label} onClick={onPlayPause}>
        {/* The state picks the artwork in CSS, the way the Figma variant picks
            which icon the nested buttonIcon is swapped to. */}
        <span className="knowieTakePlayer-glyph" aria-hidden="true" />
      </ButtonIcon>
      <Waveform state={spec.waveform} progress={spec.progress} />
      <p className="knowieTakePlayer-duration">{duration}</p>
    </div>
  );
}
