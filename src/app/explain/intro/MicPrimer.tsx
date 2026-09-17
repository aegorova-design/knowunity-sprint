/**
 * The mic primer's own content — everything `04 First run, mic primer` shows,
 * which `05 First run, example` shows again underneath its sheet. Two screens
 * need it, so it is composed once here rather than copied, the same way
 * SessionAppBar and TermPrompt are.
 *
 * Read off the Mockups v2 frame "04 First run, mic primer" (13662:14546).
 *
 * `behindSheet` marks the copy inert on 05. The sheet covers these controls
 * completely, but covered is not the same as unreachable: without this, Tab
 * still walks into Allow mic from behind the scrim.
 */

import { Button } from '@/components/button/Button';
import { IconSlot, type IconName } from '@/components/icon-slot/IconSlot';
import { MascotFigure } from '@/components/mascot-figure/MascotFigure';
import { TextBlock } from '@/components/text-block/TextBlock';

import { ActionStack } from '../ActionStack';
import { ButtonPair } from '../ButtonPair';
import { AllowMicButton } from './AllowMicButton';

import './introScreen.css';

/** Where the primer's three ways out go. */
export const PRIMER_GRANTED_HREF = '/explain/1';
export const PRIMER_DENIED_HREF = '/explain/denied';
export const PRIMER_EXAMPLE_HREF = '/explain/intro/example';
export const PRIMER_TYPE_HREF = '/explain/1/type';
export const PRIMER_CLOSE_HREF = '/plan';

/** The three explainer lines, in the frame's order. */
const POINTS: { icon: IconName; text: string }[] = [
  { icon: 'microphone-01', text: 'Tap the mic and explain each term out loud.' },
  { icon: 'lightbulb-02', text: 'Stuck? Knowie gives you a hint, not the answer.' },
  { icon: 'keyboard-01', text: 'Can’t talk right now? Type instead. It counts the same.' },
];

export function PrimerContent({ behindSheet = false }: { behindSheet?: boolean }) {
  return (
    <div className="introScreen-body" inert={behindSheet}>
      <TextBlock variant="L" title="Say it to know it" showCaption={false} titleAs="h1" />

      {/* Knowie over the top edge of what she is saying. Not mascotMessage:
          that sits her beside a left-aligned bubble, and matching this frame
          would mean forking it. Logged in component-gaps.md. */}
      <div className="introScreen-saying">
        <MascotFigure size="L" pose="Excited" />
        <p className="introScreen-bubble">
          Did you know that explaining an idea in your own words is the quickest way to find out if
          you really know it? Try it now!
        </p>
      </div>

      <ul className="introScreen-points">
        {POINTS.map((point) => (
          <li className="introScreen-point" key={point.icon}>
            {/* The line beside it already says this, so the icon is decorative.
                The colour goes on the wrapper, not on iconSlot: the component
                spreads its props after its own className, so passing one would
                replace `knowieIconSlot` rather than add to it. The artwork is a
                mask and takes currentColor, so inheriting is all it needs. */}
            <span className="introScreen-pointIcon" aria-hidden="true">
              <IconSlot size="250" icon={point.icon} />
            </span>
            <span className="introScreen-pointText">{point.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PrimerActions({ behindSheet = false }: { behindSheet?: boolean }) {
  return (
    <div className="introScreen-actions" inert={behindSheet}>
      {/* What happens next, said before it happens. The frame carries this
          line above Allow mic with its visibility switched off; shown here.

          It sits in the screen's bottom stack rather than inside the
          ActionStack: the stack holds actions, and this is the sentence about
          them. Same Space/200, so the thumb zone is unchanged. */}
      <p className="introScreen-primer">
        Next, your browser asks for the mic. Knowie only listens while you record.
      </p>

      {/* The screen's one Primary. SPEC.md: the primer is the permission ask,
          and its own three buttons are the ways out — so no Skip either. */}
      <ActionStack
        primary={<AllowMicButton grantedHref={PRIMER_GRANTED_HREF} deniedHref={PRIMER_DENIED_HREF} />}
        below={
          <ButtonPair>
            <Button
              variant="Secondary"
              size="M"
              CTA="See example"
              showLeftIcon
              leftIcon="eye"
              href={PRIMER_EXAMPLE_HREF}
            />
            {/* Text is reachable before the mic is ever asked for —
                design-brief.md and voice-ux.md both make the fallback available
                from every answerable state, and this is the first of them. */}
            <Button
              variant="Secondary"
              size="M"
              CTA="Type instead"
              showLeftIcon
              leftIcon="keyboard-01"
              href={PRIMER_TYPE_HREF}
            />
          </ButtonPair>
        }
      />
    </div>
  );
}
