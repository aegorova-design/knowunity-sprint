/**
 * 20b Revisit complete — `/explain/revisit-done`. SPEC.md screen 28. One
 * state, the end of a revisit session in place of the full summary.
 *
 * Matches the Mockups v2 frame "20b Revisit complete" (13663:19600).
 *
 * **A revisit is not a session, so there is no breakdown.** `17 Summary`
 * exists to make a claim out of three outcomes and an XP total; the terms that
 * came back unaided are a sentence, not a table. SPEC.md: "A revisit awards no
 * XP." So there are no `termRow`s, no XP pill and no Redo here — Knowie says
 * what happened and names the next check, and Done is the only way on.
 *
 * **It reports every term the session left behind**, not one — the script's
 * two in demo mode, whatever the real session left in real mode. See
 * `RevisitDoneHeading`. The student recalls them all, which is what makes
 * `21 Plan, section mastered` — "You got all 3 terms right" — true on the
 * other side of Done. The recall itself is not built; see the stubs.
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
 *
 * **Two entries, and the copy has to read from both.** `19`'s "Do it now
 * anyway" arrives with no time passed — the student pulled the terms forward
 * rather than waiting — and `20 Home, revisit` arrives five days later, with
 * them coming back on the date Knowie named. So neither line may lean on the
 * gap: the title does not say the terms "came back on their own", which is
 * only true of the scheduled return, and the caption names no day. What is
 * true from both is that they needed help last time and were explained
 * unaided this time, with one check still to come.
 *
 * The walkthrough reaches it once, through `20`. `19`'s route stays wired
 * because that is the entry the real flow uses.
 */

import { AppBar } from '@/components/app-bar/AppBar';
import { Button } from '@/components/button/Button';
import { Scaffold } from '@/components/scaffold/Scaffold';

import { ActionStack } from '../ActionStack';
import { CloseButton } from '../navigation';
import { RevisitDoneHeading } from './RevisitDoneHeading';

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
      middleContent={<RevisitDoneHeading />}
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
