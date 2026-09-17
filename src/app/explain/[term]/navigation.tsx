'use client';

/**
 * Navigation shims for the two controls that cannot carry an href.
 *
 * `Button` renders a Next `Link` when given `href`, which keeps the page a
 * Server Component. `ButtonIcon` and `RecordButton` have no such prop, and an
 * anchor cannot wrap a button, so these two push the route instead. Logged in
 * component-gaps.md.
 *
 * Nothing here draws anything: both render the library component untouched.
 */

import { useRouter } from 'next/navigation';

import { ButtonIcon } from '@/components/button-icon/ButtonIcon';
import { RecordButton } from '@/components/record-button/RecordButton';

import { withQuery } from '../href';

/**
 * Where `06b Leave session, confirm` sends the student back to when they keep
 * going — the screen they were actually on, query and all, so a take's length
 * and the rung of the hint ladder survive the detour.
 *
 * Read at the moment of the tap rather than rendered into the link: the bar is
 * a Server Component on every screen that wears it, and the alternative —
 * `useSearchParams` in here — would force a Suspense boundary onto screens
 * that are otherwise static.
 */
function leaveHrefFrom(href: string): string {
  if (typeof window === 'undefined') return href;

  return withQuery(href, { back: window.location.pathname + window.location.search });
}

export function CloseSessionButton({ href, label }: { href: string; label: string }) {
  const router = useRouter();

  return (
    <ButtonIcon
      variant="Tertiary"
      size="M"
      icon="x-close"
      label={label}
      onClick={() => router.push(leaveHrefFrom(href))}
    />
  );
}

export function StartRecordingButton({ href, label }: { href: string; label: string }) {
  const router = useRouter();

  return <RecordButton variant="Idle" state="Default" label={label} onClick={() => router.push(href)} />;
}
