'use client';

/**
 * `TakePlayback`'s real-mode counterpart — plays the actual recorded take
 * instead of a fixed-length animation. Sits beside it rather than inside it:
 * `TakePlayback` is shared by Review and Summary and its own doc comment
 * says why it is built once, and this stage only makes Review's playback
 * real (sprint plan, stage E) — Summary keeps the decorative version.
 * `ReviewPlayback.tsx` is what chooses between the two.
 *
 * Draws the same `takePlayer`, the same way `TakePlayback` does, so the two
 * are visually identical — only what drives `played` differs: real
 * `timeupdate`/`ended` events off an `<audio>` element instead of a
 * `setTimeout` clock keeping time against a number nothing is actually
 * playing.
 */

import { useEffect, useRef, useState } from 'react';

import { TakePlayer, type TakePlayerSurface } from '@/components/take-player/TakePlayer';

export function RealTakePlayback({
  blob,
  duration,
  surface = 'Page',
}: {
  /** The take itself. */
  blob: Blob;
  /** The take's length as m:ss — `formatTakeLength` on the same seconds the recording screen measured, not re-derived from the audio element's own (occasionally imprecise) metadata. */
  duration: string;
  surface?: TakePlayerSurface;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [played, setPlayed] = useState(0);

  // Created and revoked in the same effect, not split across a memo and a
  // separate cleanup: the two have to share one lifetime. Split, React
  // Strict Mode's dev-only mount-cleanup-remount revokes the URL a memoised
  // value has no way to replace, leaving `src` pointing at a blob that no
  // longer resolves — playback silently never starts. Set imperatively on
  // the element rather than through a `src` prop, so nothing here needs a
  // piece of state just to hold a value the DOM already has.
  useEffect(() => {
    const url = URL.createObjectURL(blob);
    const audio = audioRef.current;
    if (audio) audio.src = url;
    return () => URL.revokeObjectURL(url);
  }, [blob]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      return;
    }

    // A press while the take is already finished starts it over, the same
    // rule TakePlayback's decorative version follows.
    if (played >= 1) audio.currentTime = 0;
    audio.play();
  };

  return (
    <>
      <TakePlayer
        surface={surface}
        state={isPlaying ? 'Playing' : 'Default'}
        duration={duration}
        played={played}
        onPlayPause={togglePlay}
      />
      <audio
        ref={audioRef}
        // Not part of the visible UI — takePlayer draws the control.
        style={{ display: 'none' }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={(event) => {
          const audio = event.currentTarget;
          if (audio.duration > 0) setPlayed(Math.min(1, audio.currentTime / audio.duration));
        }}
        onEnded={() => {
          setIsPlaying(false);
          setPlayed(1);
        }}
      />
    </>
  );
}
