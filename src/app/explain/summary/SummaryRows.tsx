'use client';

/**
 * The three outcome rows on `17 Summary`, each one a link to its own sheet.
 *
 * A navigation shim, like `[term]/navigation.tsx`: `termRow` is a `<button>`
 * that takes `onClick` — its own stories pass one — and has no `href`, so the
 * route is pushed instead of linked. Third component to need this; logged in
 * component-gaps.md.
 *
 * Nothing here draws anything. The rows are `termRow` used as documented, in
 * the order the session ran them.
 */

import { useRouter } from 'next/navigation';

import { TermRow } from '@/components/term-row/TermRow';

import { SESSION_OUTCOMES, xpLabel } from '../script';
import { TERMS, TERM_POSITIONS } from '../session';

export function SummaryRows() {
  const router = useRouter();

  return (
    <>
      {TERM_POSITIONS.map((position) => {
        const outcome = SESSION_OUTCOMES[position];

        return (
          <TermRow
            key={position}
            variant={outcome.variant}
            term={TERMS[position].name}
            /* A number on every row, zeroes included: the three of them add
               up to the total above, and the word beside it says why this one
               is zero. */
            xp={xpLabel(outcome.xp)}
            onClick={() => router.push(`/explain/summary/${position}`)}
          />
        );
      })}
    </>
  );
}
