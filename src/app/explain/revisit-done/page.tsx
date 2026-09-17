/**
 * 20b Revisit complete — `/explain/revisit-done`. SPEC.md screen 28. One
 * state, the end of a revisit session in place of the full summary.
 *
 * Matches the Mockups v2 frame "20b Revisit complete" (13663:19600).
 *
 * **A revisit is one term, so there is no breakdown.** `17 Summary` exists to
 * make a claim out of three outcomes and an XP total; one term that came back
 * unaided is a sentence, not a table. SPEC.md: "A revisit awards no XP. One
 * term does not warrant a per-term breakdown." So there are no `termRow`s, no
 * XP pill and no Redo here — Knowie says what happened and names the next
 * check, and Done is the only way on.
 *
 * **Done goes to `/plan/mastered`.** The term that was outstanding came back
 * unaided, so the section's latest session is now all-unaided — which is what
 * `sectionHeader` reports and what Mastered means. It is also the only click
 * path to that screen in the whole flow: the scripted run always finishes 1 of
 * 3, so `17 Summary`'s Continue always lands on `/plan/to-revisit` instead.
 *
 * The close icon goes to the same place, as the primer's and `14`'s do to
 * theirs. No Skip and no progress bar: the revisit is over, and like the
 * primer and `14` this sits outside the term loop.
 */

import { AppBar } from '@/components/app-bar/AppBar';
import { Button } from '@/components/button/Button';
import { Scaffold } from '@/components/scaffold/Scaffold';

import { ActionStack } from '../ActionStack';
import { MascotHeading } from '../MascotHeading';
import { CloseButton } from '../navigation';
import { TERMS } from '../session';

/**
 * The term a revisit brings back. Serfdom is the one the scripted run leaves
 * needing another pass — it is the term that gets revealed — so it is the one
 * the frame names and the one this screen reports on.
 */
const REVISITED = TERMS['2'];

/** Where the section stands once its last outstanding term has come back. */
const DONE_HREF = '/plan/mastered';

export default function RevisitDonePage() {
  return (
    <Scaffold
      size="iPhone 13"
      topNavigation={
        <AppBar
          variant="leftIconButtonOnly"
          aria-label="Session navigation"
          left={<CloseButton href={DONE_HREF} label="Close" />}
        />
      }
      middleContent={
        <MascotHeading
          /* Excited: a recovery is the one moment in the flow worth
             celebrating. The title beside her carries it, so the pose is
             never the only thing saying so. */
          pose="Excited"
          title={`${REVISITED.name} came back on its own`}
          caption="You explained it unaided this time. One more check on Tuesday, before the exam."
        />
      }
      bottomContent={
        /* The screen's one Primary, and the only control on it. */
        <ActionStack
          primary={
            <Button
              variant="Primary"
              size="L"
              CTA="Done"
              showRightIcon
              rightIcon="arrow-right"
              href={DONE_HREF}
            />
          }
        />
      }
    />
  );
}
