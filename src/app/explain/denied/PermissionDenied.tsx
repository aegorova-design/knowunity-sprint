/**
 * What `14 Permission denied` shows — the half of the screen that the help
 * sheet at `/explain/denied/how` shows again underneath itself.
 *
 * Read off the Mockups v2 frame "14 Permission denied" (13662:14548).
 *
 * `behindSheet` marks it inert while the sheet is up, for the same reason the
 * primer does it: the sheet covers these controls, but covered is not
 * unreachable.
 */

import { Button } from '@/components/button/Button';

import { ActionStack } from '../ActionStack';
import { ButtonPair } from '../ButtonPair';
import { MascotHeading } from '../MascotHeading';

export const DENIED_TYPE_HREF = '/explain/1/type';
export const DENIED_HELP_HREF = '/explain/denied/how';
export const DENIED_CLOSE_HREF = '/plan';

export function DeniedContent({ behindSheet = false }: { behindSheet?: boolean }) {
  return (
    /* The heading beside her carries the news, so the pose is not the only
       thing saying it — SPEC.md, "no colour carries meaning alone". */
    <MascotHeading
      pose="Questioning"
      title="Knowie can’t hear you"
      caption="Microphone access is off for Knowunity. You can still finish this step by typing. Voice comes back as soon as you allow the mic."
      behindSheet={behindSheet}
    />
  );
}

export function DeniedActions({ behindSheet = false }: { behindSheet?: boolean }) {
  return (
    <ActionStack
      inert={behindSheet}
      /* The screen's one Primary. A denied student keeps text for the whole
         session — SPEC.md screen 9. */
      primary={
        <Button
          variant="Primary"
          size="L"
          CTA="Type my answers"
          showLeftIcon
          leftIcon="keyboard-01"
          href={DENIED_TYPE_HREF}
        />
      }
      below={
        <ButtonPair>
          {/* Deliberately inert. SPEC.md, Out of scope: "A web app on iOS Safari
              cannot deep-link to microphone permissions. The button is present
              because the student needs to be told where to go; it does not
              navigate." The next button is what actually tells them how. */}
          <Button variant="Secondary" size="M" CTA="Allow in Settings" showLeftIcon leftIcon="microphone-01" />
          <Button
            variant="Secondary"
            size="M"
            CTA="How to allow it"
            showLeftIcon
            leftIcon="help-circle"
            href={DENIED_HELP_HREF}
          />
        </ButtonPair>
      }
    />
  );
}
