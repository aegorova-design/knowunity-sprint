/**
 * What `17 Summary` shows — the three slots that `18 Summary, term tapped`
 * shows again underneath its sheet.
 *
 * Nothing here changed when it moved out of `page.tsx`; it moved so the sheet
 * route could draw the screen it covers instead of drawing a second copy of
 * it, which is the shape `IdleScreen.tsx` and `PermissionDenied.tsx` already
 * have for their own sheets.
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
import { SESSION_OUTCOMES } from '../script';
import { PROGRESS_LABEL, TERM_COUNT, TERM_POSITIONS } from '../session';
import { SummaryRows } from './SummaryRows';

import './summaryScreen.css';

/** Terms the student got without help — the number the claim reports. */
const UNAIDED = TERM_POSITIONS.filter(
  (position) => SESSION_OUTCOMES[position].variant === 'Unaided',
).length;

/** What the session collected, summed off the rows rather than written down. */
const TOTAL_XP = TERM_POSITIONS.reduce(
  (total, position) => total + SESSION_OUTCOMES[position].xp,
  0,
);

/**
 * Where Continue goes. SPEC.md: `/plan/to-revisit` when terms are coming back,
 * `/plan/mastered` when none are. A scripted run is 1 of 3, so it is the
 * former every time — the branch is here because the rule is, not because the
 * script exercises both.
 */
export const CONTINUE_HREF = UNAIDED === TERM_COUNT ? '/plan/mastered' : '/plan/to-revisit';

export function SummaryBar({ behindSheet = false }: { behindSheet?: boolean }) {
  // Wrapped rather than given `inert` itself, the way SessionAppBar does it:
  // the prop is not one appBar documents.
  const bar = (
    <AppBar
      variant="leftAndRightButton"
      aria-label="Session navigation"
      left={<CloseButton href={CONTINUE_HREF} label="Close" />}
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
  return (
    <div className="summaryScreen" inert={behindSheet || undefined}>
      {/* The claim. Headline L, centred — a step `textBlock` has no variant
          for, so it is the screen's own h1. See component-gaps.md. */}
      <h1 className="summaryScreen-claim">
        You explained {UNAIDED} of {TERM_COUNT} without help.
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
        +{TOTAL_XP} XP collected
      </p>

      <div className="summaryScreen-terms">
        <div className="summaryScreen-rows">
          <SummaryRows />
        </div>

        <p className="summaryScreen-tapHint">
          Tap any term to play back what you said and read the full answer.
        </p>
      </div>
    </div>
  );
}

export function SummaryActions({ behindSheet = false }: { behindSheet?: boolean }) {
  return (
    <div inert={behindSheet || undefined}>
      <ButtonGroup
        variant="Vertical"
        size="L"
        /* The screen's one Primary. */
        primary={<Button variant="Primary" size="L" CTA="Continue" href={CONTINUE_HREF} />}
        /* A fresh run of the same three terms. SPEC.md: "Redo awards full
           XP" — nothing is discounted for having been seen. */
        secondary={
          <Button
            variant="Secondary"
            size="M"
            CTA={`Redo ${TERM_COUNT} terms`}
            showLeftIcon
            leftIcon="refresh-ccw-01"
            href="/explain/1"
          />
        }
      />
    </div>
  );
}
