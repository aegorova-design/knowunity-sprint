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
 */

import type { HTMLAttributes } from 'react';

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
};

export function AnswerBlock({
  kind = 'Said',
  label = 'What you said',
  body = 'Body',
  showIcon = true,
  ...rest
}: AnswerBlockProps) {
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
    </div>
  );
}
