/**
 * takePlayer — a recorded answer the student can listen back to.
 *
 * Built from the Figma component set `takePlayer` (node 13584:6181) in
 * Yummy__Knowie Design Sprint. Prop names and options match the Figma
 * properties exactly: state, surface and duration.
 *
 * Composed, not redrawn: the control is a buttonIcon and the levels are a
 * waveform, which is how Figma nests them. The state drives all three parts at
 * once, so the button, the bars and the fill can never disagree — except for
 * the one thing a variant cannot carry, the take's playback position, which
 * arrives as `played` and is the screen's clock rather than a picture.
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
  /**
   * How far through the take playback has reached, 0 to 1. Figma has no
   * property for this either: `Playing` is drawn at a fixed halfway fill, so a
   * take of any length shows the same frozen picture for as long as it runs.
   *
   * Playing is where a position comes from. Default honours one too, so a take
   * that is paused partway holds its place instead of snapping back to the
   * start — a paused take is still mid-playback, it has just stopped moving,
   * and the control correctly offers play again. Silent ignores it: there is
   * no audio, so there is nothing to be partway through.
   *
   * Left off, every state fills exactly as its Figma variant does.
   */
  played?: number;
};

export function TakePlayer({
  state = 'Default',
  surface = 'Page',
  duration = '0:14',
  onPlayPause,
  played,
  ...rest
}: TakePlayerProps) {
  const spec = BY_STATE[state];

  // A position, where one was given and the state can be partway through it.
  // Silent falls back to its variant, which is empty by definition.
  const position = state === 'Silent' ? undefined : played;

  return (
    <div className="knowieTakePlayer" data-state={state} data-surface={surface} {...rest}>
      <ButtonIcon variant={spec.variant} size="M" label={spec.label} onClick={onPlayPause}>
        {/* The state picks the artwork in CSS, the way the Figma variant picks
            which icon the nested buttonIcon is swapped to. */}
        <span className="knowieTakePlayer-glyph" aria-hidden="true" />
      </ButtonIcon>
      <Waveform state={spec.waveform} progress={spec.progress} played={position} />
      <p className="knowieTakePlayer-duration">{duration}</p>
    </div>
  );
}
