/**
 * 09b Processing, still thinking — `/explain/[term]/checking/slow`. SPEC.md
 * screen 22. One state, entered at 5s into a wait that runs long.
 *
 * Matches the Mockups v2 frame "09b Processing, still thinking" (13663:18719).
 *
 * **It is not a second wait, it is the same one continuing.** `09 Processing`
 * hands over at `SLOW_AFTER_MS` with the query intact, and this screen runs
 * the remainder and resolves to the verdict `09` would have reached. Nothing
 * is re-sent and nothing is re-judged: the clock is the only thing that moved.
 * SPEC.md puts it on exactly one wait in the run — term 2's first attempt —
 * so it shows up in a normal run-through without being summoned.
 *
 * **What changes is what Knowie says.** The header keeps `verdict="Checking"`
 * and the block keeps shimmering, and the copy stops explaining the steps and
 * starts reassuring: by 5s the student is no longer wondering what is
 * happening, they are wondering whether it broke. "Your answer is safe" is the
 * sentence that answers that.
 *
 * **Cancel and try again is the only action**, and it is a Tertiary: the wait
 * is still expected to finish on its own, so the way out is available without
 * being recommended. It goes back to the take, which SPEC.md is specific
 * about — `/explain/[term]/review` "with the take intact" — so the length and
 * the rung travel back on the link and the student can send the same recording
 * again. A typed answer has no take to go back to, so it returns to the text
 * screen it was written on instead.
 *
 * Skip is **disabled** and the progress bar has not moved: the answer is in
 * flight and nothing has resolved. Close stays live.
 */

import { notFound } from 'next/navigation';

import { Button } from '@/components/button/Button';
import { Scaffold } from '@/components/scaffold/Scaffold';

import { withQuery } from '../../../href';
import { SLOW_AFTER_MS, SLOW_WAIT_MS, parseAttempt } from '../../../script';
import { isTermPosition, type TermPosition } from '../../../session';
import { SessionAppBar } from '../../SessionAppBar';
import { CheckingWait } from '../CheckingWait';
import { first, verdictHref, type Query } from '../outcome';

/** What is left of the long wait once `09` has spent the first five seconds. */
const REMAINING_MS = SLOW_WAIT_MS - SLOW_AFTER_MS;

const TITLE = 'Still thinking';

const CAPTION = 'This one is taking a moment. Your answer is safe.';

/**
 * Where Cancel goes: back to the answer as it was, not back to the start of
 * it. A spoken take returns to `08 Review`, carrying its length so the player
 * reports the same duration and Send answer can send it again; a typed one
 * returns to the text screen on the same rung.
 */
function cancelHref(term: TermPosition, attempt: number, query: Query): string {
  if (first(query.typed) !== undefined) {
    return withQuery(`/explain/${term}/type`, { attempt });
  }

  return withQuery(`/explain/${term}/review`, { seconds: first(query.seconds), attempt });
}

export default async function SlowCheckingPage({
  params,
  searchParams,
}: {
  params: Promise<{ term: string }>;
  searchParams: Promise<Query>;
}) {
  const { term } = await params;
  if (!isTermPosition(term)) notFound();

  const query = await searchParams;
  const attempt = parseAttempt(query.attempt);

  return (
    <Scaffold
      size="iPhone 13"
      topNavigation={<SessionAppBar term={term} skipHref="" skipState="Disabled" />}
      middleContent={
        <CheckingWait
          resolveAfterMs={REMAINING_MS}
          resolveHref={verdictHref(term, attempt, query)}
          title={TITLE}
          caption={CAPTION}
        />
      }
      bottomContent={
        <Button
          variant="Tertiary"
          size="M"
          CTA="Cancel and try again"
          href={cancelHref(term, attempt, query)}
        />
      }
    />
  );
}
