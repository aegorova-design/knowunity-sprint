/**
 * 05b Resume — `/explain/resume`. SPEC.md screen 24. One state, shown when a
 * session is reopened part-done.
 *
 * Matches the Mockups v2 frame "05b Resume, pick up where you left off"
 * (13663:19481).
 *
 * **Which terms are done travels in the URL**, as `?from=`, the term the
 * student stopped on. The session has no store — every screen in this flow is
 * a Server Component and everything it needs to know about the run so far
 * arrives on the link (see `href.ts`) — so the plan's Voice step is what says
 * where the session was left, and this screen reads it back.
 *
 * The caption is built from that rather than written out, because it names
 * terms: the frame's line is the `from=3` case exactly, and `from=2` says the
 * same thing about one term instead of two. A resume screen that named the
 * wrong terms would be worse than no resume screen.
 *
 * No Skip and no progress bar: like the primer and `14 Permission denied`,
 * this sits outside the term loop. The bar is `leftIconButtonOnly`, which is
 * what the frame draws and what SPEC.md's component list names, and close
 * leaves to the plan.
 *
 * **Start over clears the run** by starting it again at term 1. There is
 * nothing to clear beyond that: outcomes live in the URL, so a fresh link is
 * a fresh session.
 */

import { AppBar } from '@/components/app-bar/AppBar';
import { Button } from '@/components/button/Button';
import { Scaffold } from '@/components/scaffold/Scaffold';

import { PLAN_IN_PROGRESS_HREF } from '../../plan/planHref';
import { ActionStack } from '../ActionStack';
import { ButtonPair } from '../ButtonPair';
import { MascotHeading } from '../MascotHeading';
import { CloseButton } from '../navigation';
import {
  TERMS,
  TERM_COUNT,
  TERM_POSITIONS,
  isTermPosition,
  type TermPosition,
} from '../session';

/**
 * Close leaves the session for the plan, as the primer and `14` both do — for
 * `03`, the stage a started session left it on, which is where Leave put the
 * student to reach this screen in the first place.
 */
const RESUME_CLOSE_HREF = PLAN_IN_PROGRESS_HREF;

/** Start over: a fresh link is a fresh session. */
const START_OVER_HREF = '/explain/1';

/**
 * Where the student stopped. Only a term that is actually part-done can be
 * resumed, so term 1 — nothing behind it — is not one of them; anything else
 * arriving on the URL falls back to the frame's own state rather than drawing
 * a screen that contradicts itself.
 */
const DEFAULT_FROM: TermPosition = '3';

function parseFrom(raw: string | string[] | undefined): TermPosition {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value !== undefined && isTermPosition(value) && value !== '1' ? value : DEFAULT_FROM;
}

/** "Feudalism", or "Feudalism and Serfdom" — the way the frame sets them. */
function nameList(names: readonly string[]): string {
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/** One and two are the only counts a three-term session can leave. */
const REMAINING_WORD: Record<number, string> = { 1: 'One', 2: 'Two' };

/**
 * The frame's caption, with the terms and the counts filled in: "You're 2
 * terms in. Feudalism and Serfdom are done. One left."
 */
function resumeCaption(from: TermPosition): string {
  const done = TERM_POSITIONS.filter((position) => Number(position) < Number(from)).map(
    (position) => TERMS[position].name,
  );
  const remaining = TERM_COUNT - done.length;

  return [
    `You’re ${done.length} ${done.length === 1 ? 'term' : 'terms'} in.`,
    `${nameList(done)} ${done.length === 1 ? 'is' : 'are'} done.`,
    `${REMAINING_WORD[remaining]} left.`,
  ].join(' ');
}

export default async function ResumePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const from = parseFrom((await searchParams).from);

  return (
    <Scaffold
      size="iPhone 13"
      topNavigation={
        <AppBar
          variant="leftIconButtonOnly"
          aria-label="Session navigation"
          left={<CloseButton href={RESUME_CLOSE_HREF} label="Close" />}
        />
      }
      middleContent={
        /* Standby: nothing has happened yet, and there is no verdict here for
           a pose to carry. The heading beside her says the whole of it.
           Space/600, which is the gap this frame binds. */
        <MascotHeading
          pose="Standby"
          title="Pick up where you left off"
          caption={resumeCaption(from)}
          gap="600"
        />
      }
      bottomContent={
        <ActionStack
          /* The screen's one Primary: back to the term they stopped on. */
          primary={
            <Button
              variant="Primary"
              size="L"
              CTA="Continue"
              showRightIcon
              rightIcon="arrow-right"
              href={`/explain/${from}`}
            />
          }
          /* One child, filling the row — the frame's `actions row` at 358,
             not a half of it. See `component-gaps.md`. */
          below={
            <ButtonPair>
              <Button variant="Secondary" size="M" CTA="Start over" href={START_OVER_HREF} />
            </ButtonPair>
          }
        />
      }
    />
  );
}
