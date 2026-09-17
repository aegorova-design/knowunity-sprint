/**
 * 05 First run, example — `/explain/intro/example`. SPEC.md screen 8. One
 * state: the primer with a sheet over it.
 *
 * Matches the Mockups v2 frame "05 First run, example" (13662:14547).
 *
 * The primer behind is the real screen, not a picture of one, so it is the
 * same PrimerContent and PrimerActions `/explain/intro` renders — marked inert
 * while the sheet is up. The sheet covers those controls completely at 390 x
 * 844, but covered is not unreachable, and Tab would otherwise walk into Allow
 * mic from behind the scrim.
 *
 * The worked example is a term the session never asks about — "guild", not one
 * of the three — so seeing it gives nothing away.
 */

import { AnswerBlock } from '@/components/answer-block/AnswerBlock';
import { AppBar } from '@/components/app-bar/AppBar';
import { Button } from '@/components/button/Button';
import { Scaffold } from '@/components/scaffold/Scaffold';
import { TextBlock } from '@/components/text-block/TextBlock';

import { TermPrompt } from '../../[term]/TermPrompt';
import { CloseButton } from '../../navigation';
import { SheetPanel } from '../../SheetPanel';
import { PRIMER_CLOSE_HREF, PrimerActions, PrimerContent } from '../MicPrimer';

import './exampleSheet.css';

const SHEET_TITLE = 'Here’s an example';

/** The screen underneath — where both ways out of the sheet go. */
const PRIMER_HREF = '/explain/intro';

const PASSING_ANSWER =
  '"It was a group of craftsmen in the same trade in a town. They trained apprentices, set the standards for the work and controlled who could sell it."';

export default function ExamplePage() {
  return (
    <Scaffold
      size="iPhone 13"
      topNavigation={
        <AppBar
          variant="leftIconButtonOnly"
          aria-label="Primer navigation"
          left={<CloseButton href={PRIMER_CLOSE_HREF} label="Close" />}
        />
      }
      middleContent={<PrimerContent behindSheet />}
      bottomContent={<PrimerActions behindSheet />}
      showBottomSheetBackground
      bottomSheetOnly={
        <SheetPanel label={SHEET_TITLE} dismissHref={PRIMER_HREF}>
          {/* Variant S: the sheet's title is a label over the example, not a
              screen heading, and S is the step that says so. Ranged left,
              which is what textBlock does at this step, where the frame
              centres it. The colour stays text/primary. */}
          <TextBlock variant="S" title={SHEET_TITLE} showCaption={false} titleAs="h2" />

          <div className="exampleSheet-answer">
            {/* The session's own prompt, reused. "Guild" is not one of the
                three terms and the frame hides the ask underneath, which is
                why this screen used to draw the shape itself — TermPrompt now
                takes the question rather than a Term, so it does not have
                to. h3: inside the sheet it sits under the sheet's own title. */}
            <TermPrompt
              prompt="In your own words, what does guild mean?"
              showCaption={false}
              titleAs="h3"
            />

            <AnswerBlock
              kind="Answer"
              label="A passing answer:"
              body={PASSING_ANSWER}
              showIcon={false}
            />
          </div>

          {/* Dismissing the sheet is going back to the primer, which is its own
              route — so this is a link, not a close handler. Tapping outside
              the panel goes to the same place; this is the accessible way,
              since the outside layer is hidden from assistive tech. */}
          <Button variant="Primary" size="L" CTA="Got it" href={PRIMER_HREF} />
        </SheetPanel>
      }
    />
  );
}
