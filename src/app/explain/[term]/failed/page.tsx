/**
 * That didn't go through — `/explain/[term]/failed`. Real mode only: where
 * the checking screen lands when transcribing or judging fails twice (it
 * retries once on its own first).
 *
 * The copy puts the failure on us, because it is: nothing was wrong with the
 * answer. So Try again **resends the same answer** — back to the checking
 * screen, which reads it from `turnStore` — rather than asking for a new one,
 * and its icon is a refresh, not the mic. Type instead brings a typed answer
 * back filled in. No rung is spent (`NeutralRetryScreen`).
 *
 * After a reload the answer is gone from memory; Try again then lands on the
 * checking screen's reload guard, which returns to Idle for the term.
 */

import { notFound } from 'next/navigation';

import { withQuery } from '../../href';
import { parseAttempt } from '../../script';
import { isTermPosition } from '../../session';
import { NeutralRetryScreen } from '../NeutralRetryScreen';

export default async function FailedPage({
  params,
  searchParams,
}: {
  params: Promise<{ term: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { term } = await params;
  if (!isTermPosition(term)) notFound();

  const attempt = parseAttempt((await searchParams).attempt);

  return (
    <NeutralRetryScreen
      term={term}
      attempt={attempt}
      title="That didn’t go through"
      caption="Something went wrong on our end, not yours. Your answer is safe, so you can send it again."
      retry={{ href: withQuery(`/explain/${term}/checking`, { attempt }), icon: 'refresh-ccw-01' }}
      keepTyped
    />
  );
}
