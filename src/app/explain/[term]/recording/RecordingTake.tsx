'use client';

/**
 * The live half of `07 Recording`: the counter, the stop control and the way
 * out of a take that went wrong.
 *
 * The timer is real in both modes — sprint-context.md keeps recognition and
 * judging mocked but says "the recording counter and TakePlayer duration both
 * report actual elapsed time", and this is the one part of the loop that
 * always answered to the student, demo or real.
 *
 * Demo mode keeps the original behaviour exactly: no mic, a clock that counts
 * up on its own. Real mode requests the microphone and actually records —
 * `getUserMedia`/`MediaRecorder`, ported from `/voice-test`'s own capture —
 * and stores the take in `turnStore` for the checking screen to send. A
 * denied permission sends the student to the existing `/explain/denied`
 * screen rather than a new one built for this path alone.
 *
 * It keeps running under `prefers-reduced-motion`: SPEC.md's motion rule
 * stops the waveform and the skeleton shimmer, and explicitly keeps the
 * recording timer going.
 */

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/button/Button';
import { RecordButton } from '@/components/record-button/RecordButton';
import { Waveform } from '@/components/waveform/Waveform';

import { readDemoMode, useIsDemoMode } from '../../demoMode';
import { withQuery } from '../../href';
import { setInputMode } from '../../inputMode';
import { formatTakeLength } from '../../session';
import { setAudioTake } from '../../turnStore';

/** The first mime type the browser actually supports, same order as `/voice-test`. */
function detectAudioFormat(): 'audio/webm' | 'audio/mp4' {
  for (const mimeType of ['audio/webm', 'audio/mp4'] as const) {
    if (MediaRecorder.isTypeSupported(mimeType)) return mimeType;
  }
  return 'audio/webm';
}

export function RecordingTake({
  cancelHref,
  reviewHref,
  deniedHref,
}: {
  /** `14 Permission denied`, for a mic that refuses to start. */
  deniedHref: string;
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
  const isDemo = useIsDemoMode();
  const [elapsed, setElapsed] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioFormatRef = useRef<'audio/webm' | 'audio/mp4'>('audio/webm');

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

  useEffect(() => {
    // Storage, not `isDemo`: on a hard load the hook reads "off" until
    // hydration settles, and this runs once — it must not ask for the mic in
    // demo mode in that window.
    if (readDemoMode()) return;

    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        const format = detectAudioFormat();
        audioFormatRef.current = format;

        const mediaRecorder = new MediaRecorder(stream, { mimeType: format });
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) audioChunksRef.current.push(event.data);
        };
        // Timeslice, not a single chunk at stop: iOS only flushes data at a
        // timeslice boundary, per `/voice-test`'s own note on this.
        mediaRecorder.start(1000);
      })
      .catch(() => {
        if (cancelled) return;
        setInputMode('denied');
        router.replace(deniedHref);
      });

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once per mount; isDemo cannot change under this component
  }, []);

  const stopReal = () => {
    const recorder = mediaRecorderRef.current;
    const stream = streamRef.current;
    const seconds = elapsed;

    if (!recorder || recorder.state === 'inactive') {
      stream?.getTracks().forEach((track) => track.stop());
      router.push(withQuery(reviewHref, { seconds }));
      return;
    }

    recorder.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: audioFormatRef.current });
      setAudioTake(blob, seconds);
      router.push(withQuery(reviewHref, { seconds }));
    };
    recorder.stop();
    stream?.getTracks().forEach((track) => track.stop());
  };

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
          onClick={() => {
            if (isDemo) {
              // The number the student was last shown, which is the one the
              // review screen has to play back.
              router.push(withQuery(reviewHref, { seconds: elapsed }));
            } else {
              stopReal();
            }
          }}
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
