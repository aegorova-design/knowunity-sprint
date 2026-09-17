/**
 * 06b Leave session, confirm — `/explain/[term]/leave`. SPEC.md screen 25.
 * One state: the current screen behind a sheet.
 *
 * Matches the Mockups v2 frame "06b Leave session, confirm" (13663:19721).
 *
 * Every session screen's close icon lands here, which is the point: leaving is
 * always allowed, and it is never one stray tap.
 *
 * **Keep going returns to the screen the student was on**, not to a guess at
 * it. `?back=` carries that path, query and all, put there by the close button
 * at the moment of the tap (`[term]/navigation.tsx`) — so a take's length and
 * the rung of the hint ladder survive the detour. Only a path inside this
 * session is honoured, and never this route itself: a value that arrives in a
 * URL must not be able to talk the screen into sending someone elsewhere, or
 * into a loop back onto the sheet.
 *
 * **What is drawn behind is `06 Idle`**, which is what the frame draws. It is
 * the term's own screen, and the one the sheet is opened from most; a student
 * who opens it from Review or a hint screen sees the right term but not the
 * exact screen they left. Reported with the build — the honest fix is an
 * intercepting route, which is a change to how the whole flow is routed
 * rather than a change to this screen.
 *
 * The bar, the prompt and the mic are all **inert** while the sheet is up.
 * SPEC.md's "Can do" here is two things — Keep going, Leave — and a confirm
 * whose backdrop still lets the student Skip the term is a way around the
 * question rather than an answer to it. Tapping outside the panel is the third
 * way to keep going, and it goes where Keep going goes.
 *
 * **Leave goes to the plan**, carrying the term so the plan's Voice step
 * offers `05b Resume` instead of starting the run again. On term 1 there is
 * nothing to resume — nothing has resolved yet — so it goes to the plain plan.
 */

import { notFound } from 'next/navigation';

import { Button } from '@/components/button/Button';
import { Scaffold } from '@/components/scaffold/Scaffold';
import { TextBlock } from '@/components/text-block/TextBlock';

import { PLAN_IN_PROGRESS_HREF } from '../../../plan/planHref';
import { ActionStack } from '../../ActionStack';
import { ButtonPair } from '../../ButtonPair';
import { SheetPanel } from '../../SheetPanel';
import { TERMS, isTermPosition, nextTermHref, type TermPosition } from '../../session';
import { IdleActions, IdleContent } from '../IdleScreen';
import { SessionAppBar } from '../SessionAppBar';

import './leaveSheet.css';

const SHEET_TITLE = 'Leave Explain out loud?';

const SHEET_CAPTION = 'Your progress is saved. You can pick this up where you left it.';

/**
 * Where Keep going goes. The screen underneath, when the link says which one
 * and says it credibly; the term's Idle screen otherwise, which is where the
 * frame's own backdrop would put them.
 */
function keepGoingHref(term: TermPosition, raw: string | string[] | undefined): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const inSession =
    value !== undefined && value.startsWith(`/explain/${term}`) && !value.includes('/leave');

  return inSession ? value : `/explain/${term}`;
}

/**
 * Where Leave goes. The plan, per SPEC.md — carrying the term the session
 * stopped on, which is what turns the plan's Voice step into `05b Resume`.
 * Term 1 has nothing behind it, so there is nothing to resume.
 *
 * `03`, not `02`: a session has been started, so the plan that says nothing
 * has started would undo what the student just did. Both stages read
 * `?resume=` — see `planHref.ts`.
 */
function leaveHref(term: TermPosition): string {
  return term === '1'
    ? PLAN_IN_PROGRESS_HREF
    : `${PLAN_IN_PROGRESS_HREF}?resume=${term}`;
}

export default async function LeaveSessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ term: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { term } = await params;
  if (!isTermPosition(term)) notFound();

  const back = keepGoingHref(term, (await searchParams).back);

  return (
    <Scaffold
      size="iPhone 13"
      topNavigation={
        <SessionAppBar term={term} skipHref={nextTermHref(term)} behindSheet />
      }
      middleContent={<IdleContent prompt={TERMS[term].prompt} behindSheet />}
      bottomContent={<IdleActions term={term} behindSheet />}
      showBottomSheetBackground
      bottomSheetOnly={
        <SheetPanel label={SHEET_TITLE} dismissHref={back}>
          {/* One child, so the panel's own Space/600 between children never
              applies and this frame's Space/400 is what shows. */}
          <div className="leaveSheet-body">
            {/* Variant M: the frame's Headline S title, ranged left, over the
                reassurance. Not the sheet-label variant S the other two sheets
                use — this one is a question being asked, not a label over a
                list, and it is the only thing on the sheet above the answer. */}
            <TextBlock
              variant="M"
              title={SHEET_TITLE}
              caption={SHEET_CAPTION}
              showCaption
              titleAs="h2"
            />

            <ActionStack
              /* The screen's one Primary, and it is the *staying* one: a
                 confirm should make the reversible choice the easy one. */
              primary={<Button variant="Primary" size="L" CTA="Keep going" href={back} />}
              below={
                <ButtonPair>
                  {/* Tertiary, per the frame and SPEC.md — the way out is
                     available without being invited. */}
                  <Button variant="Tertiary" size="M" CTA="Leave" href={leaveHref(term)} />
                </ButtonPair>
              }
            />
          </div>
        </SheetPanel>
      }
    />
  );
}
