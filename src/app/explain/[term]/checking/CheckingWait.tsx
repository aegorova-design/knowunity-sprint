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
 * **Demo mode** is unchanged: the clock is the mocked latency from
 * SPEC.md, not a real request — 2.5s on every wait but term 2's first,
 * which runs long and hands over to `09b` at 5s. It navigates with
 * `replace`, so Back from a verdict returns to the screen the answer was
 * sent from rather than to a wait already spent.
 *
 * **Real mode** replaces the timer with the actual wait: it reads the
 * answer in flight from `turnStore`, transcribes it (unless it was typed —
 * rule 3, typed answers skip transcription), judges it, and only then
 * navigates, to wherever `realVerdict.ts` says the real verdict goes. It
 * gates on the `/voice-test` passcode first (rule 5), and if the student
 * navigates away before a response lands, the in-flight request is aborted
 * and its result is never acted on (rule 7) — see the effect's cleanup.
 *
 * A real error (transcribe or judge failing) falls back to `not-heard`
 * rather than hanging forever — "never trap the student" — though a
 * distinct slow/failed-judge experience is deferred, per the sprint plan.
 *
 * **`09b` is the same wait with different words**, in demo mode only: it
 * passes its own `title` and a fixed `caption`, and the line stops
 * stepping. Real mode has no equivalent yet — an indefinite wait shows the
 * same processing UI throughout, which is also deferred.
 */

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Skeleton } from '@/components/skeleton/Skeleton';
import { VerdictHeader } from '@/components/verdict-header/VerdictHeader';

import { readDemoMode, useIsDemoMode } from '../../demoMode';
import { withQuery } from '../../href';
import { WAIT_MS } from '../../script';
import type { TermPosition } from '../../session';
import { readTurn, recordHintTarget, setJudgeResult } from '../../turnStore';
import { realVerdictSegment } from '../../realVerdict';
import { VoicePasscodePrompt } from '../../VoicePasscodePrompt';

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

type Props = {
  /** How long this wait runs before it hands on. Demo mode only. */
  resolveAfterMs: number;
  /** The verdict the script gives, or `09b` when the wait runs long. Demo mode only. */
  resolveHref: string;
  /** The headline. `09b` says something else by then. */
  title?: string;
  /**
   * A line that stays put, for a wait whose status has already been read out.
   * Left off, the line steps through `STATUS_STEPS` the way `09` does.
   */
  caption?: string;
  /** Real mode only — absent from `09b`, which is a demo-only screen. */
  term?: TermPosition;
  rubricId?: string;
  attempt?: number;
};

export function CheckingWait({
  resolveAfterMs,
  resolveHref,
  title = 'Checking your answer',
  caption,
  term,
  rubricId,
  attempt,
}: Props) {
  const router = useRouter();
  const isDemo = useIsDemoMode();
  const [step, setStep] = useState(0);
  const [isPulsing, setIsPulsing] = useState(false);
  const [needsPasscode, setNeedsPasscode] = useState(false);

  // Demo mode's wait: unchanged from before real mode existed.
  useEffect(() => {
    if (!isDemo) return;
    const id = window.setTimeout(() => router.replace(resolveHref), resolveAfterMs);
    return () => window.clearTimeout(id);
  }, [isDemo, router, resolveAfterMs, resolveHref]);

  // Real mode's wait: an actual transcribe + judge round trip.
  useEffect(() => {
    if (isDemo || readDemoMode()) return;
    if (term === undefined || rubricId === undefined || attempt === undefined) return;

    // Captured as plain locals: TypeScript's narrowing above does not survive
    // into the async closures below, which read these several ticks later.
    const currentTerm = term;
    const currentRubricId = rubricId;
    const currentAttempt = attempt;

    let cancelled = false;
    const controller = new AbortController();
    const startedAt = Date.now();

    const goTo = (segment: string, query: Record<string, string | number | undefined> = {}) => {
      if (cancelled) return;
      router.replace(withQuery(`/explain/${currentTerm}/${segment}`, { attempt: currentAttempt, ...query }));
    };

    /** Keeps the processing UI up for at least as long as a mocked wait would, so a fast real response does not cut the status line short. */
    const settle = async () => {
      const remaining = WAIT_MS - (Date.now() - startedAt);
      if (remaining > 0) await new Promise((resolve) => setTimeout(resolve, remaining));
    };

    async function run() {
      try {
        const sessionCheck = await fetch('/api/voice-test/verify', { signal: controller.signal });
        if (cancelled) return;
        const { authenticated } = await sessionCheck.json();
        if (cancelled) return;
        if (!authenticated) {
          setNeedsPasscode(true);
          return;
        }
        await judge();
      } catch {
        // An aborted fetch (navigating away, or React Strict Mode's dev-only
        // double-invoke of this effect) rejects the same way a real network
        // failure would. `cancelled` is what tells them apart: set, this is
        // rule 7 — ignore the late response — and there is nothing to do.
        if (cancelled) return;
        await settle();
        goTo('not-heard');
      }
    }

    async function judge() {
      const turn = readTurn();

      // Silence beats everything, same rule as demo mode: nothing to send.
      if (turn.audioBlob && (turn.audioSeconds === 0 || turn.audioBlob.size === 0)) {
        await settle();
        goTo('not-heard');
        return;
      }

      let transcript: string;
      const inputMode: 'voice' | 'typed' = turn.typedAnswer !== null ? 'typed' : 'voice';

      try {
        if (turn.typedAnswer !== null) {
          transcript = turn.typedAnswer;
        } else if (turn.audioBlob) {
          const formData = new FormData();
          formData.append('audio', turn.audioBlob, 'recording.webm');
          const res = await fetch('/api/voice-test/transcribe', {
            method: 'POST',
            body: formData,
            signal: controller.signal,
          });
          if (cancelled) return;
          if (!res.ok) throw new Error('transcribe failed');
          const data = await res.json();
          transcript = data.transcript || '';
          if (!transcript) {
            await settle();
            goTo('not-heard');
            return;
          }
        } else {
          // No answer to judge — a reload lost it. PendingAnswerGuard
          // should already have caught this on Review; this is the
          // double-guard for arriving here directly.
          if (!cancelled) router.replace(`/explain/${currentTerm}`);
          return;
        }

        const judgeRes = await fetch('/api/judge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ term: currentRubricId, transcript, inputMode }),
          signal: controller.signal,
        });
        if (cancelled) return;
        if (!judgeRes.ok) throw new Error('judge failed');
        const verdict = await judgeRes.json();
        if (cancelled) return;

        setJudgeResult(currentTerm, transcript, verdict);
        // Counted here, once, right as the verdict arrives — stage D's rule:
        // hint level is per idea, by how many times that idea specifically
        // has been targeted, which only this running count can answer.
        if (verdict.hint_target) recordHintTarget(currentTerm, verdict.hint_target);
        await settle();
        goTo(realVerdictSegment(currentAttempt, verdict.verdict));
      } catch {
        if (cancelled) return;
        // Not a designed failure state yet (sprint plan defers it) — falls
        // back to the one neutral, no-rung-spent screen the app already has,
        // rather than leaving the student stuck on a wait that never ends.
        await settle();
        goTo('not-heard');
      }
    }

    run();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [isDemo, term, rubricId, attempt, router]);

  useEffect(() => {
    if (caption !== undefined) return;
    if (step >= STATUS_STEPS.length - 1) return;

    const id = window.setTimeout(() => setStep((current) => current + 1), STEP_MS);
    return () => window.clearTimeout(id);
  }, [step, caption]);

  if (needsPasscode) {
    return <VoicePasscodePrompt onUnlocked={() => setNeedsPasscode(false)} />;
  }

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
