'use client';

/**
 * The sheet on `18 Summary, term tapped`: one term's outcome, its last take
 * and its answer. A client component because the outcome is the session's —
 * the script in demo mode, what was recorded in real mode (`outcomes.ts`).
 *
 * **Two shapes, per SPEC.md.** A recorded term shows the take with what Knowie
 * heard; a term with no take — skipped, revealed after "I don't know", or
 * typed — shows the answer and its key ideas alone. `takePlayer` "must never
 * appear where the student did not record", which is the component's own rule
 * as well as SPEC.md's.
 *
 * **What Knowie heard is the answer that got the final verdict** — the last
 * take in demo mode, the recorded transcript in real mode.
 */

import { AnswerBlock } from '@/components/answer-block/AnswerBlock';
import { Button } from '@/components/button/Button';
import { IconSlot, type IconName } from '@/components/icon-slot/IconSlot';

import { useSessionOutcomes } from '../../outcomes';
import { SheetPanel } from '../../SheetPanel';
import { SUMMARY_TAKE_SECONDS, type TermOutcome } from '../../script';
import { TERMS, formatTakeLength, type TermPosition } from '../../session';
import { TakePlayback } from '../../TakePlayback';

/**
 * The badge icon each outcome carries. The same four `termRow` swaps, so the
 * row and the sheet it opens cannot disagree — design-system.md: "the sheet
 * header shows the same trio but is not this component." The map is private to
 * `termRow`, so it is repeated rather than reached into; logged in
 * component-gaps.md.
 */
const BADGE_ICON: Record<TermOutcome['variant'], IconName> = {
  Unaided: 'check',
  Hinted: 'circle-half',
  Revealed: 'eye',
  Skipped: 'skip-forward',
};

export function TermSheet({ term, dismissHref }: { term: TermPosition; dismissHref: string }) {
  const outcomes = useSessionOutcomes();
  if (!outcomes) return null;

  const { name, answer, keyIdeas } = TERMS[term];
  const { variant, transcript, inputMode } = outcomes[term];
  const recorded = inputMode === 'voice' && transcript !== null;

  return (
    <SheetPanel label={`${name}, ${variant.toLowerCase()}`} dismissHref={dismissHref}>
      {/* One child, so the panel's own Space/600 between children never
          applies and this frame's Space/400 is what shows. */}
      <div className="termSheet">
        {/* The same trio the row carries — badge, term, outcome — in the
            frame's own order. The outcome is a word in its own colour
            rather than a `statusTag`: the badge beside it is already a
            coloured shape, and a pill next to it would be a second one.
            SPEC.md named the tag here; the header design replaced it, and
            `statusTag`'s own description no longer claims this place. */}
        <header className="termSheet-header">
          <span className="termSheet-badge" data-variant={variant}>
            <IconSlot size="250" icon={BADGE_ICON[variant]} />
          </span>
          <div className="termSheet-title">
            <h2 className="termSheet-term">{name}</h2>
            {/* The word is the outcome, and the badge's icon beside it is
                what keeps it readable in greyscale — colour never carries
                this alone. */}
            <p className="termSheet-result" data-variant={variant}>
              {variant}
            </p>
          </div>
        </header>

        {recorded ? (
          <section className="termSheet-group" aria-labelledby="termSheet-takeLabel">
            <h3 className="termSheet-label" id="termSheet-takeLabel">
              Your last attempt
            </h3>

            {/* surface=Sheet: takePlayer's own rule for a player inside
                bottomSheetOnly, so it stays distinct from the sheet. */}
            <TakePlayback
              surface="Sheet"
              seconds={SUMMARY_TAKE_SECONDS}
              duration={formatTakeLength(SUMMARY_TAKE_SECONDS)}
            />

            {/* "What Knowie heard", not "What you said": a mishear reads
                as the app's mistake, which is the label the frame uses
                here and the reason design-brief.md gives for quoting the
                take back at all. Demo mode's scripted takes carry their own
                quotation marks; a real transcript gets them here. */}
            <AnswerBlock
              kind="Said"
              label="What Knowie heard"
              body={transcript.startsWith('“') ? transcript : `“${transcript}”`}
            />
          </section>
        ) : null}

        <section className="termSheet-group">
          {/* The key ideas ride inside the block since `answerBlock`'s
              Answer variant took them — which is what the hidden `key
              ideas` row in the frame is: not dropped, moved. Unticked,
              like every other place the answer is shown: the sheet is
              telling the student what the answer contains. */}
          <AnswerBlock kind="Answer" label="The answer" body={answer} keyIdeas={keyIdeas} />
        </section>

        {/* Back to the summary, which is its own route. Tapping outside
            the panel goes to the same place; this is the accessible way,
            since the outside layer is hidden from assistive tech. The
            frame carries the same Primary L in its own bottom stack. */}
        <Button variant="Primary" size="L" CTA="Done" href={dismissHref} />
      </div>
    </SheetPanel>
  );
}
