'use client';

/**
 * A player for a take that actually exists — a recording held in memory.
 * Review uses it for the take just recorded; the summary sheet for each
 * term's final take, and for demo mode's sample clips once `DemoClipPlayback`
 * has fetched one.
 *
 * Draws the same `takePlayer` `TakePlayback` does, so the two look identical.
 * The difference is that this one plays real audio. If the audio will not
 * load it renders nothing — the rule is "never show a fake one".
 */

import { useEffect, useRef, useState } from 'react';

import { TakePlayer, type TakePlayerSurface } from '@/components/take-player/TakePlayer';

import { formatTakeLength } from './session';

export function RealTakePlayback({
  blob,
  seconds,
  surface = 'Page',
}: {
  blob: Blob;
  /**
   * The take's length. Measured while recording, or decoded from a sample
   * clip — not read off the audio element, which cannot always say: Chrome
   * reports a MediaRecorder WebM's duration as Infinity, and iOS Safari may
   * not load metadata at all before a tap.
   */
  seconds: number;
  surface?: TakePlayerSurface;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [played, setPlayed] = useState(0);
  const [failed, setFailed] = useState(false);

  // Created and revoked in the same effect, so they share one lifetime: split
  // across a memo and a separate cleanup, React Strict Mode's dev-only
  // mount-cleanup-remount revokes a URL nothing then replaces, and playback
  // silently never starts. Set on the element directly, so no state exists
  // only to hold a value the DOM already has.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const url = URL.createObjectURL(blob);
    audio.src = url;
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
    audio.play().catch(() => setFailed(true));
  };

  return (
    <>
      {failed ? null : (
        <TakePlayer
          surface={surface}
          state={isPlaying ? 'Playing' : 'Default'}
          duration={formatTakeLength(seconds)}
          played={played}
          onPlayPause={togglePlay}
        />
      )}
      <audio
        ref={audioRef}
        // Not part of the visible UI — takePlayer draws the control.
        style={{ display: 'none' }}
        onError={() => setFailed(true)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={(event) => {
          const audio = event.currentTarget;
          const length =
            Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : seconds;
          if (length > 0) setPlayed(Math.min(1, audio.currentTime / length));
        }}
        onEnded={() => {
          setIsPlaying(false);
          setPlayed(1);
        }}
      />
    </>
  );
}
