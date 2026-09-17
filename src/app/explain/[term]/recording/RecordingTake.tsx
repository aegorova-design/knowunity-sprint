'use client';

/**
 * The live half of `07 Recording`: the counter, the stop control and the way
 * out of a take that went wrong.
 *
 * The timer is real — sprint-context.md keeps recognition and judging mocked
 * but says "the recording counter and TakePlayer duration both report actual
 * elapsed time", and this is the one part of the loop that answers to the
 * student. Elapsed time is measured from a start stamp rather than counted up
 * per tick, so a throttled background tab cannot make the take drift.
 *
 * It keeps running under `prefers-reduced-motion`: SPEC.md's motion rule stops
 * the waveform and the skeleton shimmer, and explicitly keeps the recording
 * timer going.
 */

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/button/Button';
import { RecordButton } from '@/components/record-button/RecordButton';
import { Waveform } from '@/components/waveform/Waveform';

import { withQuery } from '../../href';
import { formatTakeLength } from '../../session';

export function RecordingTake({
  cancelHref,
  reviewHref,
}: {
  /** Back where a discarded take leaves the student. */
  cancelHref: string;
  /**
   * Where the take goes when the student stops. Normally `08 Review`; on a
   * say-it-back it is the verdict screen that sent them here, because there is
   * nothing to send and nothing to judge.
   *
   * It may already carry a query, so the length is appended rather than tacked
   * on behind a second `?`.
   */
  reviewHref: string;
}) {
  const router = useRouter();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    // The start stamp is taken here rather than during render: reading the
    // clock while rendering is impure, and React may render more than once.
    const startedAt = Date.now();

    // Four ticks a second so the displayed second turns over close to when it
    // actually does, without the counter ever being computed from itself.
    const id = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 250);

    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="recordingScreen-bottom">
      <div className="recordingScreen-micZone">
        {/* Status, in the one place brand violet is allowed to mean live audio.
            The word carries it too, so the colour is never alone. */}
        <p className="recordingScreen-status">Listening, {formatTakeLength(elapsed)}</p>

        {/* Live: every bar takes the brand and runs the listen loop, about 2.4
            crests travelling the row. Three things say "live" and none of them
            is the colour on its own — the word, the counter, and the motion.

            The wrapper is what centres it. waveform fills its container, but
            its 24 bars are fixed-width, so in a container wider than the row
            they draw is they pack to the left. Shrinking the wrapper to the
            row's own width lets the mic zone centre it like everything else
            in the column. */}
        <div className="recordingScreen-wave">
          <Waveform state="Live" progress="0" />
        </div>

        <RecordButton
          variant="Recording"
          label="Stop recording"
          // The number the student was last shown, which is the one the review
          // screen has to play back.
          onClick={() => router.push(withQuery(reviewHref, { seconds: elapsed }))}
        />

        <p className="recordingScreen-stopLabel">Tap to stop</p>
      </div>

      {/* "Always let the student cancel and re-record before sending"
          (voice-ux.md, principle 2). A link, not a handler: nothing has been
          captured that needs discarding. */}
      <Button variant="Tertiary" size="M" CTA="Cancel" href={cancelHref} />
    </div>
  );
}
