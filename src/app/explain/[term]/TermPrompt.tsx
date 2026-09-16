/**
 * The term prompt: Knowie beside the question, with the same ask under it.
 *
 * Second screen to need it — 06 Idle and the text fallback both open on it,
 * and SPEC.md lists "the prompt" as a component of each — so it stops being
 * copied. Like SessionAppBar, it is a composition of library components that
 * only means anything inside the session, not a design-system component.
 */

import { MascotFigure } from '@/components/mascot-figure/MascotFigure';
import { TextBlock } from '@/components/text-block/TextBlock';

import { TERM_PROMPT_CAPTION, type Term } from '../session';

import './termPrompt.css';

export function TermPrompt({ term }: { term: Term }) {
  return (
    <div className="termPrompt">
      <MascotFigure size="S" pose="Standby" />
      <TextBlock
        variant="M"
        title={term.prompt}
        caption={TERM_PROMPT_CAPTION}
        showCaption
        titleAs="h1"
      />
    </div>
  );
}
