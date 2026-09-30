/**
 * Couldn't make that out — `/explain/[term]/unclear`. Real mode only: where
 * an `unclear` verdict lands, when audio came through but the judge could not
 * make out enough to check it.
 *
 * Separate from `09c Didn't catch that`, which is for a take with nothing in
 * it: "Nothing came through" would be untrue here. Same rules otherwise
 * (`NeutralRetryScreen`) — Neutral, no rung spent, Try again back to the mic
 * on the same attempt, Type instead one tap away.
 */

import { notFound } from 'next/navigation';

import { withQuery } from '../../href';
import { parseAttempt } from '../../script';
import { isTermPosition } from '../../session';
import { NeutralRetryScreen } from '../NeutralRetryScreen';

export default async function UnclearPage({
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
      title="Couldn’t make that out"
      caption="Something came through, but not clearly enough to check. Have another go, or type it instead."
      retry={{ href: withQuery(`/explain/${term}/recording`, { attempt }), icon: 'microphone-01' }}
    />
  );
}
