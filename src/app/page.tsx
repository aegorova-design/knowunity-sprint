/**
 * 01 Home, first session — the entry point.
 *
 * There is deliberately no Explain out loud entry here. On a first session the
 * only thing that introduces the step is its own caption in the plan; home only
 * surfaces it once terms are due, which is the /home/revisit screen.
 * See sprint-context.md, "Placement and return".
 *
 * The top strip and everything below the exam card are placeholder chrome.
 */

import { Button } from '@/components/button/Button';
import { MascotFigure } from '@/components/mascot-figure/MascotFigure';
import { Scaffold } from '@/components/scaffold/Scaffold';
import { TextBlock } from '@/components/text-block/TextBlock';

import { ChromeStrip } from './_chrome/ChromeStrip';
import './home.css';

export default function HomePage() {
  return (
    <Scaffold
      topNavigation={<ChromeStrip src="/chrome/home-topnav.png" height={56} />}
      middleContent={
        <div className="home">
          <div className="home-examCard">
            <MascotFigure size="L" pose="Standby" />
            <TextBlock
              variant="M"
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
