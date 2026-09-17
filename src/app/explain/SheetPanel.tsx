/**
 * The bottom sheet's panel: the rounded surface with a grabber that sits in
 * `scaffold`'s `bottomSheetOnly` slot, plus the layer that closes it when the
 * student taps outside.
 *
 * `scaffold` positions the slot and draws the scrim behind it, but nothing
 * draws the panel, and the scrim it draws takes no handler. Two screens need
 * both (`05 First run, example` and `/explain/denied/how`), so they are built
 * once here rather than twice inline.
 *
 * Each sheet is its own route, so dismissing is navigating to the screen
 * underneath: the layer is a `Link`, which needs no client component and keeps
 * both sheet pages server-rendered. Back works for free.
 *
 * It sits with the screens rather than in `src/components` for the same reason
 * `SessionAppBar` does: design-system.md does not let a screen invent a
 * design-system component, and this is page chrome.
 *
 * It is not a `dialog` and carries no `aria-modal`. Focus is not trapped here,
 * so claiming a modal would be a lie to a screen reader — see the note in
 * component-gaps.md.
 */

import Link from 'next/link';
import type { ReactNode } from 'react';

import './sheetPanel.css';

export function SheetPanel({
  label,
  dismissHref,
  children,
}: {
  /** The sheet's accessible name — what the heading inside it says. */
  label: string;
  /** The screen underneath. Tapping outside the panel goes here. */
  dismissHref: string;
  children: ReactNode;
}) {
  return (
    <>
      {/* A pointer affordance, not the accessible way out — every sheet keeps
          a real button for that, and this is hidden from the accessibility
          tree and out of the tab order rather than sitting in front of the
          sheet's own content as a full-screen unlabelled link. */}
      <Link className="sheetPanel-dismiss" href={dismissHref} aria-hidden="true" tabIndex={-1} />

      <section className="sheetPanel" aria-label={label}>
        <span className="sheetPanel-grabber" aria-hidden="true" />
        <div className="sheetPanel-content">{children}</div>
      </section>
    </>
  );
}
