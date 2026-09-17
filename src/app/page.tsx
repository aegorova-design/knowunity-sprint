/**
 * 01 Home, first session — the entry point.
 *
 * Matches the Mockups v2 frame "01 Home, first session (1 week out)"
 * (13704:8383).
 *
 * The exam line is a `verdictHeader` at verdict=Neutral, not a textBlock: the
 * frame leads with Knowie and a centred headline, which is that component's
 * shape, and Knowie is the size L Standby figure nested inside it rather than a
 * mascotFigure placed beside it. Neutral covers this — "any screen that leads
 * with Knowie and a headline rather than with a result", per the component's
 * own description — and the caption is switched off, the way the frame hides
 * that layer on its instance.
 *
 * There is deliberately no Explain out loud entry here. On a first session the
 * only thing that introduces the step is its own caption in the plan; home only
 * surfaces it once terms are due, which is 20 Home, revisit.
 * See sprint-context.md, "Placement and return".
 *
 * The top strip and the tool row are placeholder chrome. The bottom bar is
 * not: `bottomNav` is a real component now, so the strip under the exam card
 * stops at the "Ask anything" row and the bar below it is an instance with
 * home-chat lit.
 */

import { BottomNav } from '@/components/bottom-nav/BottomNav';
import { Button } from '@/components/button/Button';
import { Scaffold } from '@/components/scaffold/Scaffold';
import { VerdictHeader } from '@/components/verdict-header/VerdictHeader';

import { ChromeStrip } from './_chrome/ChromeStrip';
import { planHrefFrom } from './plan/planHref';
import './home.css';

/**
 * `?plan=` is the stage the student had reached when they tapped home, put
 * there by the plan's own home tab. Home is the one screen with no place in
 * the story, so the stage travels with them and comes back here — the same
 * way `?resume=` carries a session in flight. See `planHref.ts`.
 *
 * Without it this is the entry screen it has always been and Continue
 * studying goes to `02`, which is the reset between runs.
 */
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { plan } = await searchParams;
  const planHref = planHrefFrom(plan);

  return (
    <Scaffold
      topNavigation={<ChromeStrip src="/chrome/home-topnav.png" height={56} />}
      middleContent={
        <div className="home">
          <div className="home-examCard">
            {/* Neutral keeps the title on text.primary and pulls the Standby
                pose — the two things the frame draws. The pose is never set
                here: the verdict drives it. */}
            <VerdictHeader
              verdict="Neutral"
              titleAs="h1"
              title="Your History exam is in 1 week"
              showCaption={false}
            />
            <Button variant="Primary" size="M" CTA="Continue studying" href={planHref} />
          </div>
        </div>
      }
      bottomContent={
        <>
          {/* The tool row and "Ask anything" only. 358 wide, which is the
              content box inside bottomContent's own side padding. */}
          <ChromeStrip src="/chrome/bottomContent.png" width={358} height={100} />
          <BottomNav Active="home-chat" homeChatHref="/" studyPlanHref={planHref} />
        </>
      }
    />
  );
}
