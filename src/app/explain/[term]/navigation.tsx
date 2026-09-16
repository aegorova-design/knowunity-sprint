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

export function CloseSessionButton({ href, label }: { href: string; label: string }) {
  const router = useRouter();

  return (
    <ButtonIcon
      variant="Tertiary"
      size="M"
      icon="x-close"
      label={label}
      onClick={() => router.push(href)}
    />
  );
}

export function StartRecordingButton({ href, label }: { href: string; label: string }) {
  const router = useRouter();

  return <RecordButton variant="Idle" state="Default" label={label} onClick={() => router.push(href)} />;
}
