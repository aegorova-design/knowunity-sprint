/**
 * The thumb zone's action stack: the screen's one Primary, with an optional
 * supporting row or button under it at Space/200.
 *
 * Four screens had built this column by hand — `04 First run, mic primer`,
 * the hint screen, `14 Permission denied` and the text fallback — each with
 * its own class and the same three rules. Every screen in the flow with a
 * thumb zone wants it, so it is built once here.
 *
 * Deliberately not `buttonGroup`. That component's Vertical variant is the
 * same idea, but its contract is a Primary over a *Secondary* at the group's
 * own size, and these screens do not fit it: the text fallback puts a Tertiary
 * M under a Primary L, and the hint, primer and denied screens put a *pair* of
 * buttons there. Stretching `buttonGroup` to cover all three would mean
 * loosening a documented contract for screens it was not drawn for, so the
 * design owner's call was to leave it alone — it keeps `17` and `18 Summary`,
 * which are what it was drawn for — and let the sprint carry its own stack.
 *
 * No prop makes the children fill: `button` takes whatever width its outer box
 * is given, and a stretch column gives it the full width. See the component's
 * own "Fill And Hug" story.
 *
 * It sits with the screens rather than in `src/components` for the same reason
 * `SheetPanel` and `SessionAppBar` do: design-system.md does not let a screen
 * invent a design-system component, and this is a composition, not a part.
 */

import type { ReactNode } from 'react';

import './actionStack.css';

export function ActionStack({
  primary,
  below,
  inert,
}: {
  /** The screen's one main action. Fills the width. */
  primary: ReactNode;
  /**
   * What supports it — a `ButtonPair`, a single Secondary M, or a Tertiary M.
   * Left off, the stack is just the Primary.
   */
  below?: ReactNode;
  /** Set while a sheet covers the screen, to keep Tab out of the buttons. */
  inert?: boolean;
}) {
  return (
    <div className="actionStack" inert={inert}>
      {primary}
      {below}
    </div>
  );
}
