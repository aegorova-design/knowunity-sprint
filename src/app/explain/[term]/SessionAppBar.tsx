/**
 * The bar every session screen wears: close on the left, the progress bar in
 * the centre slot, Skip on the right — SPEC.md, "Screen detail" preamble.
 *
 * Second screen to need it, so it stops being copied. Not a design-system
 * component: it is a composition of appBar, buttonIcon, progressIndicator and
 * button, and it only makes sense inside `/explain/[term]`.
 */

import { AppBar } from '@/components/app-bar/AppBar';
import { Button } from '@/components/button/Button';
import { ProgressIndicator } from '@/components/progress-indicator/ProgressIndicator';

import { PROGRESS_LABEL, TERM_COUNT, type TermPosition, termsDoneBefore } from '../session';
import { CloseSessionButton } from './navigation';

export function SessionAppBar({
  term,
  skipHref,
  skipState = 'Default',
  resolved = false,
  behindSheet = false,
}: {
  term: TermPosition;
  /** Where Skip goes. Ignored while Skip is disabled. */
  skipHref: string;
  /**
   * SPEC.md's Skip rule: Default wherever the student can still act on this
   * term, Disabled once it is in flight or resolved.
   */
  skipState?: 'Default' | 'Disabled';
  /**
   * Whether this term is already settled. SPEC.md's Progress rule: progress
   * "advances a third on any resolution, including a skip" — so a verdict
   * screen counts its own term as done, and every screen before the verdict
   * does not. The Mockups v2 frame "10 Got it" draws the bar a third full on
   * term 1, which is what this is reading.
   */
  resolved?: boolean;
  /**
   * Set while `06b Leave session, confirm` covers the screen. The bar keeps
   * its look — the frame draws it untouched — but stops being actionable:
   * SPEC.md's "Can do" for that screen is Keep going and Leave, and a confirm
   * whose backdrop still lets the student Skip the term is a way around the
   * question rather than an answer to it.
   */
  behindSheet?: boolean;
}) {
  const bar = (
    <AppBar
      variant="leftAndRightButton"
      aria-label="Session navigation"
      left={<CloseSessionButton href={`/explain/${term}/leave`} label="Leave session" />}
      Slot={
        <ProgressIndicator
          variant="Primary"
          thickness="24"
          current={termsDoneBefore(term) + (resolved ? 1 : 0)}
          total={TERM_COUNT}
          aria-label={PROGRESS_LABEL}
        />
      }
      right={
        <Button
          variant="Tertiary"
          size="S"
          CTA="Skip"
          state={skipState}
          href={skipState === 'Disabled' ? undefined : skipHref}
        />
      }
    />
  );

  return behindSheet ? <div inert>{bar}</div> : bar;
}
