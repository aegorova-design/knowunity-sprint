/**
 * The help content behind "How to allow it" — `/explain/denied/how`.
 *
 * Not one of SPEC.md's 28 numbered frames, and no Figma frame exists for it.
 * SPEC.md screen 9 lists "the help content" as where this button leads without
 * saying what it is, and a button that leads nowhere means the screen is not
 * finished. So it is the one shape this file already has for "more, without
 * leaving": a sheet over the screen, exactly as 05 lays one over the primer.
 *
 * The copy is the design owner's, written for the iOS Settings app rather than
 * for Safari's own page menu — which is the route that actually sticks once
 * the system toggle is off. It does not branch by browser.
 */

import { AppBar } from '@/components/app-bar/AppBar';
import { Button } from '@/components/button/Button';
import { Scaffold } from '@/components/scaffold/Scaffold';
import { TextBlock } from '@/components/text-block/TextBlock';

import { CloseButton } from '../../navigation';
import { SheetPanel } from '../../SheetPanel';
import { DENIED_CLOSE_HREF, DeniedActions, DeniedContent } from '../PermissionDenied';

import './howSheet.css';

const SHEET_TITLE = 'Turn on your mic';

/** The screen underneath — where both ways out of the sheet go. */
const DENIED_HREF = '/explain/denied';

const INTRO =
  'Your iPhone is blocking the mic for Knowunity. You can change that in Settings in about 20 seconds.';

const STEPS = [
  'Open the Settings app.',
  'Tap Privacy & Security.',
  'Tap Microphone.',
  'Find Knowunity and turn it on.',
  'Come back here. Your session is saved.',
];

export default function HowToAllowPage() {
  return (
    <Scaffold
      size="iPhone 13"
      topNavigation={
        <AppBar
          variant="leftIconButtonOnly"
          aria-label="Primer navigation"
          left={<CloseButton href={DENIED_CLOSE_HREF} label="Close" />}
        />
      }
      middleContent={<DeniedContent behindSheet />}
      bottomContent={<DeniedActions behindSheet />}
      showBottomSheetBackground
      bottomSheetOnly={
        <SheetPanel label={SHEET_TITLE} dismissHref={DENIED_HREF}>
          {/* Variant S, matching the example sheet: a label over the steps
              rather than a screen heading. Colour stays text/primary. */}
          <TextBlock variant="S" title={SHEET_TITLE} showCaption={false} titleAs="h2" />

          <p className="howSheet-intro">{INTRO}</p>

          {/* Numbered, because these are steps in order rather than parallel
              facts — which is why they are not the primer's icon list. The
              marker carries the count, so no icon is needed. */}
          <ol className="howSheet-steps">
            {STEPS.map((step) => (
              <li className="howSheet-step" key={step}>
                {step}
              </li>
            ))}
          </ol>

          {/* Back to the screen underneath, which is its own route. Tapping
              outside the panel goes to the same place; this is the accessible
              way, since the outside layer is hidden from assistive tech. */}
          <Button variant="Primary" size="L" CTA="Got it" href={DENIED_HREF} />
        </SheetPanel>
      }
    />
  );
}
