'use client';

/**
 * The wait on `09 Processing` and on `09b Processing, still thinking`: the
 * status line, the clock that ends it, and Knowie's answer to an impatient
 * tap.
 *
 * Everything drawn here is a library component used as documented —
 * `verdictHeader` at verdict=Checking over `skeleton` at lines=3, Space/600
 * apart, which is the stack skeleton's own "On the Processing screen" story
 * draws. This component owns the timing and nothing else.
 *
 * The clock is the mocked latency from SPEC.md, not a real request: 2.5s on
 * every wait but term 2's first, which runs long and hands over to `09b` at
 * 5s. It navigates with `replace`, so Back from a verdict returns to the
 * screen the answer was sent from rather than to a wait already spent.
 *
 * **`09b` is the same wait with different words.** It passes its own `title`
 * and a fixed `caption`, and the line stops stepping: by then the student has
 * read all three steps once and what the screen has to say has changed from
 * "here is what is happening" to "this is taking a moment, your answer is
 * safe". Everything else — the header, the block, the pulse, the clock — is
 * the same component, because it is the same wait continuing.
 */

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Skeleton } from '@/components/skeleton/Skeleton';
import { VerdictHeader } from '@/components/verdict-header/VerdictHeader';

import './checkingScreen.css';

/**
 * The status line, in the order it steps. The first two are SPEC.md's own,
 * quoted from its motion rule — the processing screen "steps its status line —
 * 'Sending your answer', then 'Checking it'". The third is the caption the
 * Figma frame draws, which is where the line settles and stays; the long wait
 * would otherwise run out of things to say with 5s still to go.
 */
const STATUS_STEPS = [
  'Sending your answer',
  'Checking it',
  'Comparing what you said with the key ideas.',
] as const;

/**
 * How long each step holds. Short enough that the line has said all three
 * before the shortest wait — 2.5s — is over.
 */
const STEP_MS = 800;

export function CheckingWait({
  resolveAfterMs,
  resolveHref,
  title = 'Checking your answer',
  caption,
}: {
  /** How long this wait runs before it hands on. */
  resolveAfterMs: number;
  /** The verdict the script gives, or `09b` when the wait runs long. */
  resolveHref: string;
  /** The headline. `09b` says something else by then. */
  title?: string;
  /**
   * A line that stays put, for a wait whose status has already been read out.
   * Left off, the line steps through `STATUS_STEPS` the way `09` does.
   */
  caption?: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => router.replace(resolveHref), resolveAfterMs);
    return () => window.clearTimeout(id);
  }, [router, resolveAfterMs, resolveHref]);

  useEffect(() => {
    if (caption !== undefined) return;
    if (step >= STATUS_STEPS.length - 1) return;

    const id = window.setTimeout(() => setStep((current) => current + 1), STEP_MS);
    return () => window.clearTimeout(id);
  }, [step, caption]);

  return (
    // The tap surface is the whole stack, and it is deliberately not a control:
    // there is nothing here to activate. A tap gets Knowie's acknowledgement
    // and nothing else — no navigation, and nothing that could send the answer
    // a second time. Keyboard and assistive tech are offered no handle on it,
    // because there is no action behind it to offer them. Taps landing during
    // a pulse are absorbed rather than queued, so leaning on the screen does
    // not build up a backlog of beats.
    <div className="checkingScreen-body" onPointerDown={() => setIsPulsing(true)}>
      <div
        className={isPulsing ? 'checkingScreen-pulse' : undefined}
        onAnimationEnd={() => setIsPulsing(false)}
      >
        <VerdictHeader
          verdict="Checking"
          title={title}
          caption={caption ?? STATUS_STEPS[step]}
          titleAs="h1"
          // The caption is the only thing on the screen that changes while the
          // student waits, so it is the only thing worth announcing. Polite
          // rather than assertive: the wait ends on its own and nothing here
          // needs interrupting.
          aria-live="polite"
        />
      </div>

      {/* Still, on purpose: Knowie is the moving part and the headline is the
          reading part, so the block is neither. skeleton's own story makes the
          argument. */}
      <Skeleton lines="3" />
    </div>
  );
}
