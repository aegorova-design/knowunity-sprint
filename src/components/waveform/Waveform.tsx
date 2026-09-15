/**
 * waveform — the audio level display.
 *
 * Built from the Figma component set `waveform` (node 13584:6119) in
 * Yummy__Knowie Design Sprint. Prop names and options match the Figma variant
 * axes: state and progress.
 *
 * Decoration, not information. The description is explicit that it "must never
 * be the only thing telling the student what is happening", so it is hidden
 * from assistive tech — the label, the timer and the icon beside it carry the
 * state.
 */

import type { HTMLAttributes } from 'react';

import './waveform.css';

export type WaveformState = 'Live' | 'Idle' | 'Silent';

/** The same quarters progressIndicator offers, and for the same reason. */
export type WaveformProgress = '0' | '25' | '50' | '75' | '100';

/** Figma draws 24 bars, all named `bar`. Playback lands on the nearest quarter. */
const BAR_COUNT = 24;

export type WaveformProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  /** Live while recording, Idle for a take at rest, Silent when nothing was captured. */
  state?: WaveformState;
  /**
   * How far through playback, in quarters. Only Idle uses it — Figma has
   * progress steps on Idle alone, and Live and Silent exist at 0 only.
   */
  progress?: WaveformProgress;
};

export function Waveform({ state = 'Live', progress = '0', ...rest }: WaveformProps) {
  // Only Idle carries a split, so Live stays whole and Silent stays empty
  // whatever progress says. That keeps the component from drawing a
  // combination the variants do not offer.
  const filled = state === 'Idle' ? Math.round((BAR_COUNT * Number(progress)) / 100) : 0;

  return (
    <div
      className="knowieWaveform"
      data-state={state}
      data-progress={progress}
      aria-hidden="true"
      {...rest}
    >
      {Array.from({ length: BAR_COUNT }, (_, i) => (
        <span
          key={i}
          className="knowieWaveform-bar"
          data-filled={i < filled ? 'true' : undefined}
        />
      ))}
    </div>
  );
}
