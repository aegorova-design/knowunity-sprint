/**
 * 08 Review — `/explain/[term]/review`. SPEC.md screen 20. The take the
 * student just made, before it is sent.
 *
 * Matches the Mockups v2 frame "08 Review" (13662:14535).
 *
 * The take's length rides in on `?seconds=`, put there by `07 Recording` when
 * the student stopped: the player has to report the number they were just
 * watching count up, which SPEC.md's walkthrough checks — "Stop → Review shows
 * that same duration."
 *
 * No transcript, per SPEC.md: correcting one turns the loop into an editing
 * step. The student checks the take by listening to it.
 *
 * Skip is live — the take has not been sent, so the student can still act on
 * this term — per SPEC.md's Skip rule, which lists 08 among the live screens.
 *
 * `?attempt=` rides in from `07 Recording` and straight back out again on
 * every link that leads to another go: the wait reads it to pick the verdict,
 * and Record again and Type instead have to stay on the same rung rather than
 * dropping the student back to the first one.
 */

import { notFound } from 'next/navigation';

import { Button } from '@/components/button/Button';
import { Scaffold } from '@/components/scaffold/Scaffold';

import { ActionStack } from '../../ActionStack';
import { ButtonPair } from '../../ButtonPair';
import { withQuery } from '../../href';
import { parseAttempt } from '../../script';
import { TERMS, formatTakeLength, isTermPosition, nextTermHref } from '../../session';
import { TakePlayback } from '../../TakePlayback';
import { SessionAppBar } from '../SessionAppBar';
import { TermPrompt } from '../TermPrompt';

import './reviewScreen.css';

/**
 * What the player shows when the screen is opened without a take behind it —
 * `takePlayer`'s own documented default, so the screen falls back to what the
 * component already says rather than to a number invented here. Every click
 * path in comes from `07 Recording`, which always carries the real one.
 */
const FALLBACK_SECONDS = 14;

function takeSeconds(raw: string | string[] | undefined): number {
  const value = Number(Array.isArray(raw) ? raw[0] : raw);
  return Number.isInteger(value) && value >= 0 ? value : FALLBACK_SECONDS;
}

export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ term: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { term } = await params;
  if (!isTermPosition(term)) notFound();

  const query = await searchParams;
  const seconds = takeSeconds(query.seconds);
  const attempt = parseAttempt(query.attempt);

  return (
    <Scaffold
      size="iPhone 13"
      topNavigation={<SessionAppBar term={term} skipHref={nextTermHref(term)} />}
      // The question stays up while the student listens back, so they can hear
      // their answer against what was asked. Same placement as 06 and 07.
      middleContent={<TermPrompt prompt={TERMS[term].prompt} />}
      bottomContent={
        // Figma's "bottom stack": the player over the action group.
        <div className="reviewScreen-bottom">
          <TakePlayback seconds={seconds} duration={formatTakeLength(seconds)} />

          <ActionStack
            primary={
              <Button
                variant="Primary"
                size="L"
                CTA="Send answer"
                showRightIcon
                rightIcon="arrow-right"
                // The take's length goes with it: a take of no length is the
                // silence `09c` catches, and SPEC.md catches it after the
                // wait, not here. The rung goes with it too — the wait is what
                // turns the two into a verdict.
                href={withQuery(`/explain/${term}/checking`, { seconds, attempt })}
              />
            }
            below={
              <ButtonPair>
                {/* Back to the mic with this take dropped. No `?seconds=`, so
                    the next take starts from zero — that is what "discarded"
                    means here. The rung stays, because dropping a take is not
                    spending a hint. */}
                <Button
                  variant="Secondary"
                  size="M"
                  CTA="Record again"
                  showLeftIcon
                  leftIcon="microphone-01"
                  href={withQuery(`/explain/${term}/recording`, { attempt })}
                />
                <Button
                  variant="Secondary"
                  size="M"
                  CTA="Type instead"
                  showLeftIcon
                  leftIcon="keyboard-01"
                  href={withQuery(`/explain/${term}/type`, { attempt })}
                />
              </ButtonPair>
            }
          />
        </div>
      }
    />
  );
}
