'use client';

/**
 * A take the student can play back: `takePlayer` at rest, and running while it
 * plays.
 *
 * Two screens have one — `08 Review`, before the take is sent, and
 * `18 Summary, term tapped`, which plays the take that was judged — so by the
 * rule in `component-gaps.md` it is built once here rather than copied. The
 * only thing that differs between them is the surface it sits on.
 *
 * `takePlayer` has no `href` and its `onPlayPause` is a handler, so this much
 * of each screen is a client component. Everything else — the app bar, the
 * prompt, the buttons, the sheet — stays on the server and is handed to the
 * page.
 *
 * Playback is timed off the take's real length, not a fixed guess:
 * sprint-context.md keeps recognition and judging mocked but says the
 * TakePlayer duration reports actual elapsed time, and SPEC.md's walkthrough
 * checks it — "Play it back; it runs for that long."
 *
 * The clock does two jobs now. It ends playback, as it always did, and it
 * feeds `played` to the player so the fill travels the row with the take
 * instead of sitting at the halfway mark for its whole length. The fraction is
 * the whole of what this screen knows; how a bar lights, and what a fraction
 * looks like as bars, belong to `waveform` — the row's step count is the one
 * thing read back from it, so the clock wakes when a bar is reached rather
 * than at a rate invented here.
 *
 * Under `prefers-reduced-motion` the fill still advances — it is position, and
 * SPEC.md's motion rule keeps position and timers running while it stops the
 * loops — and `waveform.css` drops only the flip between the two colours.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { TakePlayer, type TakePlayerSurface } from '@/components/take-player/TakePlayer';
import { BAR_COUNT } from '@/components/waveform/Waveform';

/**
 * How long the full row holds before the take returns to rest.
 *
 * This is `motion.duration.pressOut` (140ms) — the same token the bar flip
 * runs on, and it is here because it is that flip: the last bar is still
 * lighting when playback ends, and the row would otherwise be cleared
 * mid-light on a short take, where the gap between the last bar and the end is
 * only a fraction of a second. It is a raw number because a `useEffect` cannot
 * read a CSS custom property. If that token changes, change this with it —
 * nothing links the two.
 */
const FULL_ROW_HOLD_MS = 140;

export function TakePlayback({
  seconds,
  duration,
  surface = 'Page',
}: {
  /** The take's length, which is how long playback runs. */
  seconds: number;
  /** That same length as m:ss, which is what the player shows. */
  duration: string;
  /** What it sits on. Sheet inside `bottomSheetOnly`, per takePlayer's own rule. */
  surface?: TakePlayerSurface;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [played, setPlayed] = useState(0);

  // The position is read by the clock as well as rendered, and reading state
  // inside the effect would either go stale or restart playback every frame.
  // The ref is the clock's copy; the state is the drawn one.
  const playedRef = useRef(0);
  const setPosition = useCallback((value: number) => {
    playedRef.current = value;
    setPlayed(value);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const total = seconds * 1000;

    // Where the take is resumed from. A pause keeps its position, so pressing
    // play again continues rather than starting the take over.
    const startedAt = Date.now() - playedRef.current * total;

    let timer = 0;

    const step = () => {
      // Measured against the clock rather than counted up, the way the
      // recording counter is, so a throttled tab cannot make playback drift. A
      // take of no length is over as soon as it starts.
      const position = total > 0 ? Math.min(1, (Date.now() - startedAt) / total) : 1;
      setPosition(position);

      if (position >= 1) {
        // The row is already full here: `waveform` rounds to the nearest bar,
        // so the last one lights half a bar's width of time before the end and
        // the take finishes on a complete row rather than completing it at the
        // moment it stops.
        //
        // The control goes back to offering play at once, which is true the
        // moment the take is over. The full row is left standing; the effect
        // below is what clears it.
        setPosition(1);
        setIsPlaying(false);
        return;
      }

      // One wake-up per bar, at the moment that bar is reached. Rounding to the
      // nearest puts the boundaries half a bar in from each end, which is where
      // the half comes from.
      //
      // Not requestAnimationFrame: it stops in a background tab, which would
      // park the fill mid-take, and it would run the row sixty times a second
      // to redraw something that changes twenty-four times in total. Not a
      // fixed tick either — a rate picked here would be a number with nothing
      // behind it, and it would land bars late on a short take.
      const nextBoundary = Math.min(1, (Math.floor(position * BAR_COUNT + 0.5) + 0.5) / BAR_COUNT);
      timer = window.setTimeout(step, Math.max(0, nextBoundary * total - (Date.now() - startedAt)));
    };

    step();

    // Cleared on pause and on unmount, so a student who pauses and plays again
    // gets one clock rather than two.
    return () => window.clearTimeout(timer);
  }, [isPlaying, seconds, setPosition]);

  // The end of the take: the row stands full for one flip, then empties. Its
  // own clock, because the one above is cleared the moment playback stops.
  useEffect(() => {
    if (isPlaying || played < 1) return;

    const id = window.setTimeout(() => setPosition(0), FULL_ROW_HOLD_MS);
    return () => window.clearTimeout(id);
  }, [isPlaying, played, setPosition]);

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    // A press while the full row is still standing starts the take again from
    // the top rather than resuming a take that has nothing left to play.
    if (playedRef.current >= 1) setPosition(0);
    setIsPlaying(true);
  };

  return (
    <TakePlayer
      surface={surface}
      state={isPlaying ? 'Playing' : 'Default'}
      duration={duration}
      // Pause holds the fill where it is. It used to return to the start,
      // because the component had no partway point to hold; it has one now.
      played={played}
      onPlayPause={togglePlay}
    />
  );
}
