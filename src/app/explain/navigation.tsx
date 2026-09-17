'use client';

/**
 * The close action for the two screens that sit outside the term loop —
 * `04 First run, mic primer` and `14 Permission denied`. Both leave to `/plan`.
 *
 * `buttonIcon` has no `href` — the gap `[term]/navigation.tsx` already logs —
 * so the route is pushed instead. Nothing here draws anything.
 *
 * Deliberately not `CloseSessionButton` from `[term]/navigation.tsx`: that one
 * leaves a session in progress and belongs to the loop. These screens are
 * before a session exists.
 */

import { useRouter } from 'next/navigation';

import { ButtonIcon } from '@/components/button-icon/ButtonIcon';

export function CloseButton({ href, label }: { href: string; label: string }) {
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
