'use client';

/**
 * What `17 Summary` shows — the three slots that `18 Summary, term tapped`
 * shows again underneath its sheet.
 *
 * Nothing here changed when it moved out of `page.tsx`; it moved so the sheet
 * route could draw the screen it covers instead of drawing a second copy of
 * it, which is the shape `IdleScreen.tsx` and `PermissionDenied.tsx` already
 * have for their own sheets.
 *
 * Every number here comes from `useSessionOutcomes` — the script in demo
 * mode, what the session recorded in real mode (`outcomes.ts`). While that
 * is not yet known (the server render, and the first client render of a hard
 * load) the outcome-shaped parts render nothing rather than a number that is
 * about to change.
 *
 * `behindSheet` marks the covered controls inert. Covered is not unreachable:
 * without it, Tab still walks the three rows and Continue while a sheet
 * is showing one term's answer.
 */

import { useEffect, useRef } from 'react';

import { AppBar } from '@/components/app-bar/AppBar';
import { Button } from '@/components/button/Button';
import { ButtonGroup } from '@/components/button-group/ButtonGroup';
import { IconSlot } from '@/components/icon-slot/IconSlot';
import { ProgressIndicator } from '@/components/progress-indicator/ProgressIndicator';

import { readDemoMode } from '../demoMode';
import { BackButton, CloseButton } from '../navigation';
import {
  continueHref,
  markSessionCompleted,
  totalXp,
  unaidedCount,
  useLatestOutcomes,
  useSessionOutcomes,
  type SessionOutcomes,
} from '../outcomes';
import { PROGRESS_LABEL, TERM_COUNT, TERM_POSITIONS, type TermPosition } from '../session';
import { SummaryRows } from './SummaryRows';

import './summaryScreen.css';

/**
 * The review the plan opens after a session (`/explain/review`) is this
 * screen with three differences: it reads the latest result for each term
 * across every session rather than this session's, it is read-only — a back
 * arrow to the plan where Close and Continue were — and its rows open the
 * review's own sheets.
 */
export const REVIEW_HREF = '/explain/review';

/** This session's outcomes on the summary; the latest across sessions on the review. */
function useScreenOutcomes(review: boolean): SessionOutcomes | null {
  const session = useSessionOutcomes();
  const latest = useLatestOutcomes();
  return review ? latest : session;
}

/**
 * Where Continue, Close and the review's back arrow go: the plan the student
 * will see, which is decided by the latest results across sessions — the same
 * ones the plan's own header counts.
 */
function usePlanHref(): string {
  const latest = useLatestOutcomes();
  return latest ? continueHref(latest) : FALLBACK_CONTINUE_HREF;
}

/**
 * Where Continue and Close go before the outcomes are known. `/plan/to-revisit`
 * is where every scripted run and most real ones land; it is replaced as soon
 * as the real destination can be read.
 */
const FALLBACK_CONTINUE_HREF = '/plan/to-revisit';

export function SummaryBar({ behindSheet = false, review = false }: { behindSheet?: boolean; review?: boolean }) {
  const planHref = usePlanHref();

  // Wrapped rather than given `inert` itself, the way SessionAppBar does it:
  // the prop is not one appBar documents.
  const bar = (
    <AppBar
      variant="leftAndRightButton"
      aria-label="Session navigation"
      left={
        review ? (
          <BackButton href={planHref} label="Back to the plan" />
        ) : (
          <CloseButton href={planHref} label="Close" />
        )
      }
      Slot={
        <ProgressIndicator
          variant="Primary"
          thickness="24"
          current={TERM_COUNT}
          total={TERM_COUNT}
          aria-label={PROGRESS_LABEL}
        />
      }
      /* Present and disabled: the frame hides it, but a control that
         vanishes on the last screen of a flow reads as a layout change
         rather than as the end of the run. Disabled says the same thing
         the Skip rule says everywhere else — there is nothing left to act
         on — and it keeps the bar the shape it has been all session. The
         design owner's call. */
      right={<Button variant="Tertiary" size="S" CTA="Skip" state="Disabled" />}
    />
  );

  return behindSheet ? <div inert>{bar}</div> : bar;
}

/** "Play back what you said" only promises what is there: with no spoken answer, there is nothing to play. */
function tapHint(outcomes: SessionOutcomes): string {
  const spoke = TERM_POSITIONS.some((position) => outcomes[position].inputMode === 'voice');
  return spoke
    ? 'Tap any term to play back what you said and read the full answer.'
    : 'Tap any term to see what you typed and read the full answer.';
}

export function SummaryContent({
  behindSheet = false,
  review = false,
  focusTerm,
}: {
  behindSheet?: boolean;
  review?: boolean;
  /** The term whose sheet is open: its row is scrolled into view behind the sheet. */
  focusTerm?: TermPosition;
}) {
  const outcomes = useScreenOutcomes(review);
  const rowsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!outcomes || !focusTerm) return;
    const row = rowsRef.current?.children[TERM_POSITIONS.indexOf(focusTerm)];
    row?.scrollIntoView({ block: 'center' });
  }, [outcomes, focusTerm]);

  // Reaching the summary is what completes a session, and what puts "Review
  // answers" on the plan.
  useEffect(() => {
    if (!review && !readDemoMode()) markSessionCompleted();
  }, [review]);

  if (!outcomes) return <div className="summaryScreen" />;

  return (
    <div className="summaryScreen" inert={behindSheet || undefined}>
      {/* The claim. Headline L, centred — a step `textBlock` has no variant
          for, so it is the screen's own h1. See component-gaps.md. */}
      <h1 className="summaryScreen-claim">
        You explained {unaidedCount(outcomes)} of {TERM_COUNT} without help.
      </h1>

      {/* The XP total, in the frame's outlined pill. Not a component:
          `statusTag` and `chips` are both something else. */}
      <p className="summaryScreen-xp">
        {/* The bolt goes in as `children`, not as `icon`. `iconSlot` draws a
            named icon as a CSS mask so it can take the slot's colour, and a
            mask uses only alpha — it would flatten this one's two tones into a
            single silhouette. Passing it as an element is what the component
            documents for artwork outside its set, and the artwork is already
            drawn in the system's own values: the body is violet/500, which is
            accent/brand/bold, over blue/950. So the colour is the asset's,
            not the slot's, and there is nothing left here to recolour. */}
        <span className="summaryScreen-xpIcon">
          <IconSlot size="300" aria-hidden="true">
            {/* A local SVG at exactly the size it is drawn at. next/image
                would wrap it in a layout box and optimise nothing, which is
                the same call `ChromeStrip` makes. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/bolt.svg" alt="" draggable={false} />
          </IconSlot>
        </span>
        +{totalXp(outcomes)} XP collected
      </p>

      <div className="summaryScreen-terms">
        <div className="summaryScreen-rows" ref={rowsRef}>
          <SummaryRows outcomes={outcomes} sheetBase={review ? REVIEW_HREF : '/explain/summary'} />
        </div>

        <p className="summaryScreen-tapHint">{tapHint(outcomes)}</p>
      </div>
    </div>
  );
}

export function SummaryActions({ behindSheet = false }: { behindSheet?: boolean }) {
  const href = usePlanHref();

  return (
    <div inert={behindSheet || undefined}>
      <ButtonGroup
        variant="Vertical"
        size="L"
        /* The screen's one Primary, and its only exit. No Redo: an
           immediate redo is recognition, not recall, and the revisit Knowie
           schedules on the plan is the intended second attempt. */
        primary={<Button variant="Primary" size="L" CTA="Continue" href={href} />}
      />
    </div>
  );
}
