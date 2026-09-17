/**
 * 04 First run, mic primer — `/explain/intro`. SPEC.md screen 7. One state,
 * shown once per student, and the screen that asks for the microphone.
 *
 * Matches the Mockups v2 frame "04 First run, mic primer" (13662:14546), with
 * one deliberate departure: the frame's appBar is `leftAndRightButton` and
 * carries Skip, and SPEC.md says this screen has none — "the primer is the
 * permission ask, and its own three buttons are the ways out". SPEC.md wins on
 * behaviour, so the bar is `leftIconButtonOnly`. Reported with the build.
 *
 * There is no Skip and no progress bar because there is no term yet: the
 * session starts on the far side of the permission prompt.
 */

import { AppBar } from '@/components/app-bar/AppBar';
import { Scaffold } from '@/components/scaffold/Scaffold';

import { CloseButton } from '../navigation';
import { PRIMER_CLOSE_HREF, PrimerActions, PrimerContent } from './MicPrimer';

export default function MicPrimerPage() {
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
      middleContent={<PrimerContent />}
      bottomContent={<PrimerActions />}
    />
  );
}
