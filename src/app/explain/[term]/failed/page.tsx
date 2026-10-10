/**
 * That didn't go through — `/explain/[term]/failed`. Real mode only: where
 * the checking screen lands when transcribing or judging fails twice (it
 * retries once on its own first).
 *
 * The copy puts the failure on us, because it is: nothing was wrong with the
 * answer. So the Primary, Try sending again, **resends the same answer** —
 * back to the checking screen, which reads it from `turnStore` — and its icon
 * is a refresh, not the mic.
 *
 * The Secondary is the same way of answering again, not the other one: the
 * input mode does not change here. In voice mode, Record again drops the
 * failed take and returns to Idle on the same attempt, ready to record. In
 * type mode (or with the mic refused), Type again returns to the field on the
 * same attempt with the typed answer still in it. Neither spends a rung or a
 * hint — the failure is ours. The way to switch modes stays on Idle and the
 * answer screens.
 *
 * After a reload the answer is gone from memory; Try sending again then lands
 * on the checking screen's reload guard, which returns to Idle for the term.
 */

import { notFound } from 'next/navigation';

import { Button } from '@/components/button/Button';

import { withQuery } from '../../href';
import { readInputMode } from '../../inputModeServer';
import { FIRST_ATTEMPT, parseAttempt } from '../../script';
import { isTermPosition } from '../../session';
import { NeutralRetryScreen } from '../NeutralRetryScreen';
import { RecordAgainButton } from './RecordAgainButton';

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
  const { mode } = await readInputMode();

  return (
    <NeutralRetryScreen
      term={term}
      attempt={attempt}
      title="That didn’t go through"
      caption="Something went wrong on our end, not yours. Your answer is safe, so you can send it again."
      retry={{
        href: withQuery(`/explain/${term}/checking`, { attempt }),
        icon: 'refresh-ccw-01',
        label: 'Try sending again',
      }}
      secondary={
        mode === 'voice' ? (
          <RecordAgainButton
            href={withQuery(`/explain/${term}`, { attempt: attempt > FIRST_ATTEMPT ? attempt : undefined })}
          />
        ) : (
          <Button
            variant="Secondary"
            size="M"
            CTA="Type again"
            showLeftIcon
            leftIcon="keyboard-01"
            href={withQuery(`/explain/${term}/type`, { attempt, keep: 1 })}
          />
        )
      }
    />
  );
}
