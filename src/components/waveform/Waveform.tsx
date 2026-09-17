/**
 * waveform — the audio level display.
 *
 * Built from the Figma component set `waveform` (node 13584:6119) in
 * Yummy__Knowie Design Sprint. Prop names and options match the Figma variant
 * axes: state and progress. `played` is a third way in that Figma has no
 * property for — a take that is playing back has a real position, and the four
 * quarters cannot draw it — so it is documented in the stories and in the
 * component's Figma description rather than as a variant.
 *
 * Decoration, not information. The description is explicit that it "must never
 * be the only thing telling the student what is happening", so it is hidden
 * from assistive tech — the label, the timer and the icon beside it carry the
 * state.
 */

import type { CSSProperties, HTMLAttributes } from 'react';

import './waveform.css';

export type WaveformState = 'Live' | 'Idle' | 'Silent';

/** The same quarters progressIndicator offers, and for the same reason. */
export type WaveformProgress = '0' | '25' | '50' | '75' | '100';

/**
 * Figma draws 24 bars, all named `bar`.
 *
 * Exported because it is the row's step count as well as its bar count: a
 * clock feeding `played` schedules its wake-ups on it, so a bar lights at the
 * moment playback reaches it rather than at whatever rate the screen happened
 * to pick. One source of truth for the 24.
 */
export const BAR_COUNT = 24;

export type WaveformProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  /** Live while recording, Idle for a take at rest, Silent when nothing was captured. */
  state?: WaveformState;
  /**
   * How far through playback, in quarters. Only Idle uses it — Figma has
   * progress steps on Idle alone, and Live and Silent exist at 0 only.
   */
  progress?: WaveformProgress;
  /**
   * Where playback has actually reached, 0 to 1. Only Idle uses it, and it
   * wins over `progress` when both are given.
   *
   * `progress` is the Figma variant axis and stops at quarters, which is four
   * visible jumps however long the take is. A take that is playing has a real
   * position, so the player hands over that position and the row rounds it to
   * the nearest bar — 24 steps, not 4. Rounding to the nearest, rather than
   * down, is also what fills the last bar just before the take ends rather
   * than exactly on it.
   */
  played?: number;
};

export function Waveform({ state = 'Live', progress = '0', played, ...rest }: WaveformProps) {
  // A position if one was given, the variant's quarter otherwise. Clamped
  // because a clock can overshoot its own end by a frame.
  const position =
    played === undefined ? Number(progress) / 100 : Math.min(1, Math.max(0, played));

  // Only Idle carries a split, so Live stays whole and Silent stays empty
  // whatever progress says. That keeps the component from drawing a
  // combination the variants do not offer.
  const filled = state === 'Idle' ? Math.round(BAR_COUNT * position) : 0;

  return (
    <div
      className="knowieWaveform"
      data-state={state}
      // The attribute names the variant the row is closest to, so it never
      // contradicts what is drawn: `progress` when that is what set the fill,
      // and the nearest quarter to the position when a position did.
      data-progress={played === undefined ? progress : String(Math.round(position * 4) * 25)}
      aria-hidden="true"
      {...rest}
    >
      {Array.from({ length: BAR_COUNT }, (_, i) => (
        <span
          key={i}
          className="knowieWaveform-bar"
          data-filled={i < filled ? 'true' : undefined}
          // The bar's place in the row, which the listen loop turns into its
          // delay. Twenty-four distinct delays cannot come from nth-child, and
          // a repeating nth-child group would march six identical fours rather
          // than travel the row.
          style={{ '--i': i } as CSSProperties}
        />
      ))}
    </div>
  );
}
