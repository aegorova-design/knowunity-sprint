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
 * One header, no card: there is nothing to quote back. One Primary, and the
 * other input mode under it, because the text fallback has to be reachable
 * from every answerable state — except on `failed`, which offers the same
 * mode again instead (see that page).
 */

import type { ReactNode } from 'react';

import { Button } from '@/components/button/Button';
import type { IconName } from '@/components/icon-slot/IconSlot';
import { Scaffold } from '@/components/scaffold/Scaffold';
import { VerdictHeader } from '@/components/verdict-header/VerdictHeader';

import { ActionStack } from '../ActionStack';
import { ButtonPair } from '../ButtonPair';
import { withQuery } from '../href';
import { readInputMode } from '../inputModeServer';
import { OtherModeButton } from '../ModeButtons';
import { nextTermHref, type TermPosition } from '../session';
import { readQueue } from '../requeueServer';
import { SessionAppBar } from './SessionAppBar';

import '../verdictBody.css';

export async function NeutralRetryScreen({
  term,
  attempt,
  title,
  caption,
  retry,
  secondary,
}: {
  term: TermPosition;
  attempt: number;
  title: string;
  caption: string;
  /** The Primary: record again, or resend the same answer. Labelled "Try again" unless it says otherwise. */
  retry: { href: string; icon: IconName; label?: string };
  /** The row under it. Left off, it offers the input mode the student is not in. */
  secondary?: ReactNode;
}) {
  const inputMode = await readInputMode();
  const queue = await readQueue();

  return (
    <Scaffold
      size="iPhone 13"
      topNavigation={<SessionAppBar term={term} skipHref={nextTermHref(term, queue)} />}
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
              CTA={retry.label ?? 'Try again'}
              showLeftIcon
              leftIcon={retry.icon}
              href={retry.href}
            />
          }
          /* One child, filling the row — the frame's `actions row` at 358,
             not a half of it. See `component-gaps.md`. */
          below={
            <ButtonPair>
              {secondary ?? (
                <OtherModeButton
                  inputMode={inputMode}
                  voiceHref={withQuery(`/explain/${term}/recording`, { attempt })}
                  typeHref={withQuery(`/explain/${term}/type`, { attempt })}
                />
              )}
            </ButtonPair>
          }
        />
      }
    />
  );
}
