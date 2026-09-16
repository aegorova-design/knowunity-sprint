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
}: {
  term: TermPosition;
  /** Where Skip goes. Ignored while Skip is disabled. */
  skipHref: string;
  /**
   * SPEC.md's Skip rule: Default wherever the student can still act on this
   * term, Disabled once it is in flight or resolved.
   */
  skipState?: 'Default' | 'Disabled';
}) {
  return (
    <AppBar
      variant="leftAndRightButton"
      aria-label="Session navigation"
      left={<CloseSessionButton href={`/explain/${term}/leave`} label="Leave session" />}
      Slot={
        <ProgressIndicator
          variant="Primary"
          thickness="24"
          current={termsDoneBefore(term)}
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
}
