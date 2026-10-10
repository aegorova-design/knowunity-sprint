/**
 * "This part isn't in the prototype yet" — `/plan/not-yet`. Where Practice
 * again, Practice sooner and the Explain out loud step go in a facilitator's
 * plan-state preview (`/tester`): the revisit session they would start is not
 * built, and the preview must not start a real one. Back returns to the plan
 * state it came from, which the preview still holds.
 *
 * Built from what the flow already has — `MascotHeading` over one Primary, the
 * shape of `14 Permission denied` — rather than a new screen design.
 */

import { AppBar } from '@/components/app-bar/AppBar';
import { Button } from '@/components/button/Button';
import { Scaffold } from '@/components/scaffold/Scaffold';

import { ActionStack } from '../../explain/ActionStack';
import { MascotHeading } from '../../explain/MascotHeading';
import { BackButton } from '../../explain/navigation';
import { PLAN_TO_REVISIT_HREF } from '../planHref';

/** Only a plan route is honoured: the value arrives in a URL. */
function backHref(raw: string | string[] | undefined): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value?.startsWith('/plan/') ? value : PLAN_TO_REVISIT_HREF;
}

export default async function NotYetPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const back = backHref((await searchParams).back);

  return (
    <Scaffold
      size="iPhone 13"
      topNavigation={
        <AppBar variant="leftIconButtonOnly" aria-label="Navigation" left={<BackButton href={back} label="Back" />} />
      }
      middleContent={
        <MascotHeading
          pose="Questioning"
          title="This part isn’t in the prototype yet"
          caption="Practising from the plan starts the revisit session, which comes in a later version."
        />
      }
      bottomContent={<ActionStack primary={<Button variant="Primary" size="L" CTA="Back" href={back} />} />}
    />
  );
}
