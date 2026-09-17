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
 * The top strip and everything below the exam card are placeholder chrome.
 */

import { Button } from '@/components/button/Button';
import { Scaffold } from '@/components/scaffold/Scaffold';
import { VerdictHeader } from '@/components/verdict-header/VerdictHeader';

import { ChromeStrip } from './_chrome/ChromeStrip';
import './home.css';

export default function HomePage() {
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
            <Button variant="Primary" size="M" CTA="Continue studying" href="/plan" />
          </div>
        </div>
      }
      bottomContent={<ChromeStrip src="/chrome/home-bottom.png" height={185} />}
    />
  );
}
