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
 * without it, Tab still walks the three rows, Continue and Redo while a sheet
 * is showing one term's answer.
 */

import { AppBar } from '@/components/app-bar/AppBar';
import { Button } from '@/components/button/Button';
import { ButtonGroup } from '@/components/button-group/ButtonGroup';
import { IconSlot } from '@/components/icon-slot/IconSlot';
import { ProgressIndicator } from '@/components/progress-indicator/ProgressIndicator';

import { CloseButton } from '../navigation';
import {
  continueHref,
  totalXp,
  unaidedCount,
  useSessionOutcomes,
  type SessionOutcomes,
} from '../outcomes';
import { PROGRESS_LABEL, TERM_COUNT } from '../session';
import { SummaryRows } from './SummaryRows';

import './summaryScreen.css';

/**
 * Terms that needed help — the number Redo offers to run again. The
 * complement of the claim directly above it, so the button can never offer a
 * count the headline contradicts.
 *
 * The frame says "Redo 3 terms". The design owner narrowed it to the terms
 * that did not land on their own, which on the scripted run is 2. A real run
 * that lands all three has nothing to narrow to, so it offers the frame's
 * "Redo 3 terms" back.
 */
function redoLabel(outcomes: SessionOutcomes): string {
  const count = TERM_COUNT - unaidedCount(outcomes) || TERM_COUNT;
  return `Redo ${count} ${count === 1 ? 'term' : 'terms'}`;
}

/**
 * Where Continue and Close go before the outcomes are known. `/plan/to-revisit`
 * is where every scripted run and most real ones land; it is replaced as soon
 * as the real destination can be read.
 */
const FALLBACK_CONTINUE_HREF = '/plan/to-revisit';

export function SummaryBar({ behindSheet = false }: { behindSheet?: boolean }) {
  const outcomes = useSessionOutcomes();
  const closeHref = outcomes ? continueHref(outcomes) : FALLBACK_CONTINUE_HREF;

  // Wrapped rather than given `inert` itself, the way SessionAppBar does it:
  // the prop is not one appBar documents.
  const bar = (
    <AppBar
      variant="leftAndRightButton"
      aria-label="Session navigation"
      left={<CloseButton href={closeHref} label="Close" />}
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

export function SummaryContent({ behindSheet = false }: { behindSheet?: boolean }) {
  const outcomes = useSessionOutcomes();

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
        <div className="summaryScreen-rows">
          <SummaryRows outcomes={outcomes} />
        </div>

        <p className="summaryScreen-tapHint">
          Tap any term to play back what you said and read the full answer.
        </p>
      </div>
    </div>
  );
}

export function SummaryActions({ behindSheet = false }: { behindSheet?: boolean }) {
  const outcomes = useSessionOutcomes();
  const href = outcomes ? continueHref(outcomes) : FALLBACK_CONTINUE_HREF;

  return (
    <div inert={behindSheet || undefined}>
      <ButtonGroup
        variant="Vertical"
        size="L"
        /* The screen's one Primary. */
        primary={<Button variant="Primary" size="L" CTA="Continue" href={href} />}
        /* A fresh run of the terms that needed help. SPEC.md: "Redo awards
           full XP" — nothing is discounted for having been seen.

           The destination is still `/explain/1`, which runs all three: the
           session has no store, so there is nowhere to carry "these two" to.
           The copy is the design owner's and leads the behaviour. */
        secondary={
          <Button
            variant="Secondary"
            size="M"
            CTA={outcomes ? redoLabel(outcomes) : 'Redo'}
            showLeftIcon
            leftIcon="refresh-ccw-01"
            href="/explain/1"
          />
        }
      />
    </div>
  );
}
