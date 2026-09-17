/**
 * The middle of a reveal: Knowie over the answer itself, with the four key
 * ideas underneath.
 *
 * `13 Answer revealed` and `13b Answer revealed, said back` draw it
 * identically apart from two values — the title and the caption — so by the
 * rule in `component-gaps.md` it stops being copied at the second screen.
 *
 * The key ideas sit inside the answer block since `answerBlock`'s Answer
 * variant took them. Both frames still draw them as a centred group under the
 * block; the component is the newer word, and a screen does not get to keep
 * its own copy of something the component now owns.
 *
 * They are unticked on both screens. The say-back used to tick them — the
 * student had just said all four — but a reveal tells the student what the
 * answer contains rather than recording what they covered, so the two screens
 * read the same and the component offers no other state.
 *
 * `verdict="Neutral"` is fixed rather than a prop. Both screens are Neutral,
 * and they are Neutral for a reason worth holding still: being shown an answer
 * is not a wrong answer, and saying it back afterwards is not a right one.
 * voice-ux.md separates the two from a miss deliberately, and a prop here
 * would invite a third reveal that quietly reads as one.
 *
 * It sits in `[term]/` beside `TermPrompt` rather than in `src/components`,
 * for the reason design-system.md gives: a screen does not invent a
 * design-system component, and this is a composition of three of them.
 */

import { AnswerBlock } from '@/components/answer-block/AnswerBlock';
import { VerdictHeader } from '@/components/verdict-header/VerdictHeader';

import type { Term } from '../session';

import '../verdictBody.css';

export function RevealedAnswer({
  term,
  title,
  caption,
}: {
  term: Term;
  /** "Here's the idea" on 13; "That's the one to remember" on 13b. */
  title: string;
  /** What the line under it credits — the takes behind it, or the say-back. */
  caption: string;
}) {
  return (
    <div className="verdictBody">
      <VerdictHeader verdict="Neutral" title={title} caption={caption} titleAs="h1" />

      {/* The block is labelled with the term itself, the way the frames label
          it "Feudalism" — the student has stopped being asked and is now being
          told, so the passage carries its own heading.

          The four key ideas ride inside it. They used to be a `CoveredIdeas`
          group under the block, which is how both frames still draw them; the
          updated `answerBlock` puts them in the Answer variant itself, so the
          screen hands them over rather than drawing a second group. */}
      <div className="verdictCards">
        <AnswerBlock
          kind="Answer"
          label={term.name}
          body={term.answer}
          keyIdeas={term.keyIdeas}
        />
      </div>
    </div>
  );
}
