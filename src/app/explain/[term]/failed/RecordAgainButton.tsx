'use client';

/**
 * Record again on "That didn't go through": drops the take that failed to send
 * and goes back to Idle on the same attempt, ready to record. Dropped on the
 * tap, so nothing can resend it by accident.
 */

import { Button } from '@/components/button/Button';

import { readDemoMode } from '../../demoMode';
import { clearTurn } from '../../turnStore';

export function RecordAgainButton({ href }: { href: string }) {
  return (
    <Button
      variant="Secondary"
      size="M"
      CTA="Record again"
      showLeftIcon
      leftIcon="microphone-01"
      href={href}
      onClick={() => {
        if (!readDemoMode()) clearTurn();
      }}
    />
  );
}
