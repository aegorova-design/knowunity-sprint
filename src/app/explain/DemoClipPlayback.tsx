'use client';

/**
 * Demo mode's sample take for a term, on the summary sheet. Fetches the clip
 * and decodes it to learn its exact length before showing anything, then
 * hands it to the same `RealTakePlayback` a real recording uses.
 *
 * Decoded rather than read off an `<audio>` element's metadata: iOS Safari
 * may not load metadata before a tap, which would leave the player hidden
 * forever. A missing file, or one that will not decode, renders nothing —
 * never a player with nothing behind it.
 */

import { useEffect, useState } from 'react';

import type { TakePlayerSurface } from '@/components/take-player/TakePlayer';

import { RealTakePlayback } from './RealTakePlayback';

type Clip = { blob: Blob; seconds: number };

export function DemoClipPlayback({ src, surface }: { src: string; surface?: TakePlayerSurface }) {
  const [clip, setClip] = useState<Clip | null>(null);

  useEffect(() => {
    let cancelled = false;
    const context = new AudioContext();

    fetch(src)
      .then((response) => (response.ok ? response.blob() : Promise.reject()))
      .then(async (blob) => {
        const decoded = await context.decodeAudioData(await blob.arrayBuffer());
        if (!cancelled) setClip({ blob, seconds: Math.max(1, Math.round(decoded.duration)) });
      })
      .catch(() => {
        // Missing or undecodable: no player.
      })
      .finally(() => context.close());

    return () => {
      cancelled = true;
    };
  }, [src]);

  if (!clip) return null;
  return <RealTakePlayback blob={clip.blob} seconds={clip.seconds} surface={surface} />;
}
