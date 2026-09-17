/**
 * answerBlock — a labelled passage of text about the current term.
 *
 * Built from the Figma component set `answerBlock` (node 13584:6191) in
 * Yummy__Knowie Design Sprint. Prop names and options match the Figma
 * properties exactly: kind, label, body and showIcon.
 *
 * The icon goes through iconSlot at Size 250, the way Figma nests it and the
 * way design-system.md requires — "Every icon goes through iconSlot. Never
 * place a raw icon."
 *
 * **Answer carries the term's key ideas.** The updated `kind=Answer` variant
 * holds a labelled row of chips inside the block, under the body, and takes
 * the outline the Said kind has rather than a fill. Figma bakes four chips in
 * with no text property for them, so the ideas arrive here as a list: a reveal
 * is about one term, and its ideas are that term's.
 *
 * They have one state, and it is the unticked one Figma draws. `chips`'s
 * `active` is not exposed: a reveal tells the student what the answer contains
 * rather than recording what they covered, and that is true on the say-back
 * and on the summary too. Ticked chips are `CoveredIdeas`' business, on the
 * two pass screens.
 *
 * They are also not the colour that unticked state draws. Figma overrides all
 * four instances to interactive/secondary with interactive/onSecondary labels,
 * in place of background/surface and text/primary. The recolour lives in
 * answerBlock.css, scoped to this block, because `chips` has no variant that
 * offers it. `CoveredIdeas` carries the same override for the two pass
 * screens — see component-gaps.md.
 */

import type { HTMLAttributes } from 'react';

import { Chips } from '../chips/Chips';
import { IconSlot } from '../icon-slot/IconSlot';

import './answerBlock.css';

export type AnswerBlockKind = 'Said' | 'Hint' | 'Answer';

export type AnswerBlockProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  /** Which of the three treatments. Said is quoted back, Hint nudges, Answer reveals. */
  kind?: AnswerBlockKind;
  /** The line above the body, naming what the passage is. */
  label?: string;
  /** The passage itself. Keep it to three lines — this is a glance, not a passage. */
  body?: string;
  /** Whether the icon shows. Matches the Figma boolean, which defaults to true. */
  showIcon?: boolean;
  /**
   * The term's key ideas, drawn as chips inside the block. Answer only — the
   * other two kinds have nothing to list, and Figma gives the group to that
   * variant alone.
   *
   * Figma has no property for them: the variant nests four chips with their
   * labels set on the instances. A reveal is about one term and the ideas are
   * that term's, so they are passed rather than fixed. Left off, the block is
   * the label and the body, which is every use of Answer before this.
   */
  keyIdeas?: readonly string[];
};

/**
 * The group's own name, fixed the way `statusTag`'s label is: it is a text
 * layer in the variant rather than a property, and what it names does not
 * change from term to term.
 */
const IDEAS_LABEL = 'The key ideas';

export function AnswerBlock({
  kind = 'Said',
  label = 'What you said',
  body = 'Body',
  showIcon = true,
  keyIdeas,
  ...rest
}: AnswerBlockProps) {
  // Answer alone carries them, so no other kind can draw a combination the
  // variants do not offer — the same rule waveform's progress follows.
  const ideas = kind === 'Answer' && keyIdeas && keyIdeas.length > 0 ? keyIdeas : null;

  return (
    <div className="knowieAnswerBlock" data-kind={kind} {...rest}>
      <div className="knowieAnswerBlock-labelRow">
        {showIcon ? (
          <IconSlot size="250">
            {/* The kind picks the artwork in CSS, the same way the Figma variant
                picks which icon the slot is swapped to. Decorative: the label
                beside it already says what this is. */}
            <span className="knowieAnswerBlock-icon" aria-hidden="true" />
          </IconSlot>
        ) : null}
        <p className="knowieAnswerBlock-label">{label}</p>
      </div>
      <p className="knowieAnswerBlock-body">{body}</p>

      {ideas ? (
        <div className="knowieAnswerBlock-ideas">
          {/* The visible name is hidden from assistive tech and given to the
              list instead, so the four chips are reached as one named group
              rather than announced twice. `chips` renders a button whatever it
              is handed, which is what makes the name matter. */}
          <p className="knowieAnswerBlock-ideasLabel" aria-hidden="true">
            {IDEAS_LABEL}
          </p>
          <ul className="knowieAnswerBlock-chips" aria-label={IDEAS_LABEL}>
            {ideas.map((idea) => (
              <li key={idea}>
                {/* Untickable. The ideas are what the answer contains, not a
                    set with two states: every screen that shows the reveal is
                    telling the student something rather than recording what
                    they got, and Figma draws all four unticked. */}
                <Chips
                  size="S"
                  color="Primary"
                  active="False"
                  showLeftIcon={false}
                  showRightIcon={false}
                  Text={idea}
                />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
