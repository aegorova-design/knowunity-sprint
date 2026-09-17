/**
 * The term prompt: Knowie beside the question, with the same ask under it.
 *
 * Second screen to need it — 06 Idle and the text fallback both open on it,
 * and SPEC.md lists "the prompt" as a component of each — so it stops being
 * copied. Like SessionAppBar, it is a composition of library components that
 * only means anything inside the session, not a design-system component.
 *
 * It takes the question rather than a `Term`. The session's three screens pass
 * `term.prompt` and take the defaults; `05 First run, example` draws the same
 * shape around a word the session never asks about ("guild") with the caption
 * off, which a `Term` could not express — so it had its own copy of this rule
 * until the prop widened. That is the change `component-gaps.md` predicted the
 * fourth use would need.
 */

import type { ElementType } from 'react';

import { MascotFigure } from '@/components/mascot-figure/MascotFigure';
import { TextBlock } from '@/components/text-block/TextBlock';

import { TERM_PROMPT_CAPTION } from '../session';

import './termPrompt.css';

export function TermPrompt({
  prompt,
  caption = TERM_PROMPT_CAPTION,
  showCaption = true,
  titleAs = 'h1',
}: {
  /** The question Knowie is asking. */
  prompt: string;
  /** The ask under it. Defaults to the session's, which is the same every time. */
  caption?: string;
  /** Whether the ask shows. Off in the example sheet, where the frame hides it. */
  showCaption?: boolean;
  /**
   * Heading level for the question. It is the screen's h1 on every session
   * screen; inside a sheet it sits under the sheet's own title instead.
   */
  titleAs?: Extract<ElementType, 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'>;
}) {
  return (
    <div className="termPrompt">
      <MascotFigure size="S" pose="Standby" />
      <TextBlock
        variant="M"
        title={prompt}
        caption={caption}
        showCaption={showCaption}
        titleAs={titleAs}
      />
    </div>
  );
}
