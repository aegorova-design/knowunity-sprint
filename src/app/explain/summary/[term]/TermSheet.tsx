'use client';

/**
 * The sheet on `18 Summary, term tapped`: one term's outcome, its last take
 * and its answer. A client component because the outcome is the session's —
 * the script in demo mode, what was recorded in real mode (`outcomes.ts`).
 *
 * **Three shapes.** A spoken term shows its final take and what Knowie heard.
 * A typed term shows what was typed, with no player. A term with no answer —
 * skipped, or revealed after "I don't know" — shows the answer and its key
 * ideas alone. `takePlayer` "must never appear where the student did not
 * record", which is the component's own rule as well as SPEC.md's.
 *
 * **The player plays real audio or does not appear.** Real mode plays the
 * recording that got the final verdict (`sessionTakes.ts`); after a reload
 * that recording is gone, and the player goes with it, while what Knowie
 * heard stays. Demo mode plays the design owner's sample clip for the term
 * (`demoClipHref`), and hides the player if the file is not there.
 */

import { useEffect, useState } from 'react';

import { AnswerBlock } from '@/components/answer-block/AnswerBlock';
import { Button } from '@/components/button/Button';
import { IconSlot, type IconName } from '@/components/icon-slot/IconSlot';

import { DemoClipPlayback } from '../../DemoClipPlayback';
import { useIsDemoMode } from '../../demoMode';
import { useLatestOutcomes, useSessionOutcomes } from '../../outcomes';
import { RealTakePlayback } from '../../RealTakePlayback';
import { demoClipHref, type TermOutcome } from '../../script';
import { SaidAnswer } from '../../SaidAnswer';
import { readStoredTake, readTake, type SessionTake } from '../../sessionTakes';
import { TERMS, type TermPosition } from '../../session';
import { SheetPanel } from '../../SheetPanel';

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

/**
 * The take behind the review's sheet: read from IndexedDB, so it arrives a
 * tick after the sheet. Undefined until then, and for good if there is none —
 * the player stays hidden rather than drawn with nothing behind it.
 */
function useStoredTake(term: TermPosition, enabled: boolean): SessionTake | undefined {
  const [take, setTake] = useState<{ term: TermPosition; take: SessionTake | undefined } | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    readStoredTake(term).then((found) => {
      if (!cancelled) setTake({ term, take: found });
    });
    return () => {
      cancelled = true;
    };
  }, [term, enabled]);

  return take?.term === term ? take.take : undefined;
}

export function TermSheet({
  term,
  dismissHref,
  review = false,
}: {
  term: TermPosition;
  dismissHref: string;
  /** The review the plan opens: the latest result across sessions, and the stored take. */
  review?: boolean;
}) {
  const isDemo = useIsDemoMode();
  const session = useSessionOutcomes();
  const latest = useLatestOutcomes();
  const storedTake = useStoredTake(term, review && !isDemo);
  const outcomes = review ? latest : session;
  if (!outcomes) return null;

  const { name, answer, keyIdeas } = TERMS[term];
  const { variant, transcript, inputMode } = outcomes[term];
  const take = isDemo ? undefined : review ? storedTake : readTake(term);

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

        {transcript !== null ? (
          <section className="termSheet-group" aria-labelledby="termSheet-takeLabel">
            <h3 className="termSheet-label" id="termSheet-takeLabel">
              Your last attempt
            </h3>

            {inputMode === 'voice' ? (
              <>
                {/* surface=Sheet: takePlayer's own rule for a player inside
                    bottomSheetOnly, so it stays distinct from the sheet. */}
                {isDemo ? (
                  <DemoClipPlayback surface="Sheet" src={demoClipHref(term)} />
                ) : take ? (
                  <RealTakePlayback surface="Sheet" blob={take.blob} seconds={take.seconds} />
                ) : null}

                {/* "What Knowie heard", not "What you said": a mishear reads
                    as the app's mistake, which is the label the frame uses
                    here and the reason design-brief.md gives for quoting the
                    take back at all. Demo mode's scripted takes carry their
                    own quotation marks; a real transcript gets them here. */}
                <SaidAnswer text={transcript} typed={false} />
              </>
            ) : (
              /* A typed answer, as typed, and no player: there is no audio. */
              <SaidAnswer text={transcript} typed />
            )}
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
