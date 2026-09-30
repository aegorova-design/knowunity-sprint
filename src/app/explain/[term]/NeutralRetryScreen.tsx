/**
 * The shape shared by the three "that didn't work, and it isn't a wrong
 * answer" screens: `09c Didn't catch that` (silence), "Couldn't make that
 * out" (an unclear verdict) and "That didn't go through" (a failed request).
 *
 * All three are Neutral, never Miss — voice-ux.md: separate "misheard" from
 * "didn't know it", and a failure on our side is neither. None of them costs
 * a rung: the `attempt` they arrive with goes straight back out unchanged.
 * Skip stays live and the progress bar does not move — nothing resolved.
 *
 * One header, no card: there is nothing to quote back. One Primary, and Type
 * instead under it, because the text fallback has to be reachable from every
 * answerable state, and these are the ones where the voice path just failed.
 */

import { Button } from '@/components/button/Button';
import type { IconName } from '@/components/icon-slot/IconSlot';
import { Scaffold } from '@/components/scaffold/Scaffold';
import { VerdictHeader } from '@/components/verdict-header/VerdictHeader';

import { ActionStack } from '../ActionStack';
import { ButtonPair } from '../ButtonPair';
import { withQuery } from '../href';
import { nextTermHref, type TermPosition } from '../session';
import { SessionAppBar } from './SessionAppBar';

import '../verdictBody.css';

export function NeutralRetryScreen({
  term,
  attempt,
  title,
  caption,
  retry,
  keepTyped = false,
}: {
  term: TermPosition;
  attempt: number;
  title: string;
  caption: string;
  /** What Try again does: record again, or resend the same answer. */
  retry: { href: string; icon: IconName };
  /** Whether Type instead brings back a typed answer that was in flight. */
  keepTyped?: boolean;
}) {
  return (
    <Scaffold
      size="iPhone 13"
      topNavigation={<SessionAppBar term={term} skipHref={nextTermHref(term)} />}
      middleContent={
        <div className="verdictBody">
          <VerdictHeader verdict="Neutral" title={title} caption={caption} titleAs="h1" />
        </div>
      }
      bottomContent={
        <ActionStack
          primary={
            <Button
              variant="Primary"
              size="L"
              CTA="Try again"
              showLeftIcon
              leftIcon={retry.icon}
              href={retry.href}
            />
          }
          /* One child, filling the row — the frame's `actions row` at 358,
             not a half of it. See `component-gaps.md`. */
          below={
            <ButtonPair>
              <Button
                variant="Secondary"
                size="M"
                CTA="Type instead"
                showLeftIcon
                leftIcon="keyboard-01"
                href={withQuery(`/explain/${term}/type`, {
                  attempt,
                  keep: keepTyped ? 1 : undefined,
                })}
              />
            </ButtonPair>
          }
        />
      }
    />
  );
}
