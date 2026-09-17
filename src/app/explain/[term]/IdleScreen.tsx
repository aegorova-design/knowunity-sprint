/**
 * What `06 Idle` shows — the half of the screen that `06b Leave session,
 * confirm` shows again underneath its sheet.
 *
 * Read off the Mockups v2 frame "06 Idle" (13662:14533). Nothing here changed
 * when it moved out of `page.tsx`; it moved so the sheet route could draw the
 * screen it covers instead of drawing a second copy of it, which is the shape
 * `PermissionDenied.tsx` already has for `/explain/denied/how`.
 *
 * `behindSheet` marks the covered controls inert. Covered is not unreachable:
 * without it, Tab still walks into the mic and the two ways out while a
 * confirm is asking whether to leave at all.
 */

import { Button } from '@/components/button/Button';

import { ButtonPair } from '../ButtonPair';
import { TermPrompt } from './TermPrompt';
import { StartRecordingButton } from './navigation';

import './idleScreen.css';

/**
 * The prompt. Nothing in it is focusable, so the wrapper only appears when
 * there is a sheet over it — `inert` also takes it out of the accessibility
 * tree, which is the part that matters here.
 */
export function IdleContent({ prompt, behindSheet = false }: { prompt: string; behindSheet?: boolean }) {
  if (!behindSheet) return <TermPrompt prompt={prompt} />;

  return (
    <div inert>
      <TermPrompt prompt={prompt} />
    </div>
  );
}

export function IdleActions({
  term,
  behindSheet = false,
}: {
  term: string;
  behindSheet?: boolean;
}) {
  return (
    <div className="idleScreen-bottom" inert={behindSheet || undefined}>
      <div className="idleScreen-micZone">
        <StartRecordingButton href={`/explain/${term}/recording`} label="Start recording" />
        {/* The record button's visible label and helper. Not a Storybook
            component — recordButton's own `label` is its accessible name,
            and this copy is the page's. Logged in component-gaps.md. */}
        <div className="idleScreen-micCopy">
          <p className="idleScreen-micLabel">Tap to start</p>
          <p className="idleScreen-micHelper">About 30 seconds is plenty</p>
        </div>
      </div>

      <ButtonPair>
        {/* SPEC.md leaves where "I don't know" lives open; this frame
            answers it by putting it here. What it does is settled — one
            hint, then the reveal — and that hint is its own neutral
            screen, not `hint-1`: the ladder's first rung carries a Miss
            verdict and quotes back what Knowie heard, and a student who
            has not spoken yet has neither. */}
        <Button
          variant="Secondary"
          size="M"
          CTA="I don’t know"
          showLeftIcon
          leftIcon="help-circle"
          href={`/explain/${term}/hint`}
        />
        <Button
          variant="Secondary"
          size="M"
          CTA="Type instead"
          showLeftIcon
          leftIcon="keyboard-01"
          href={`/explain/${term}/type`}
        />
      </ButtonPair>
    </div>
  );
}
