/**
 * 20 Home, revisit — `/home/revisit`. SPEC.md screen 4. Home once terms are
 * due, which is the one place Explain out loud is offered from outside the
 * plan.
 *
 * Matches the Mockups v2 frame "20 Home, revisit (5 days out)" (13704:8860).
 *
 * Same shape as `01 Home` and the same chrome, with three things different:
 * the exam is nearer, the header keeps its caption, and the actions swap
 * emphasis. SPEC.md calls that caption "a '1 term to revisit' line" and the
 * frame draws it as the `verdictHeader`'s own caption rather than as a
 * separate block, which is what is built here — one component carrying the
 * headline and the line under it, the way every other Neutral header does.
 *
 * Explain out loud is the Primary here and Continue studying is demoted to a
 * Tertiary text link, which is the whole point of the screen: the terms are
 * due, so the recall session is the thing to do and studying on is the
 * alternative. Only this screen makes that offer — see sprint-context.md,
 * "Placement and return", and `01 Home`, which deliberately makes none.
 *
 * The top strip and everything below the actions are placeholder chrome.
 */

import { Button } from '@/components/button/Button';
import { Scaffold } from '@/components/scaffold/Scaffold';
import { VerdictHeader } from '@/components/verdict-header/VerdictHeader';

import { ChromeStrip } from '../../_chrome/ChromeStrip';

import '../../home.css';

export default function HomeRevisitPage() {
  return (
    <Scaffold
      topNavigation={<ChromeStrip src="/chrome/home-topnav.png" height={56} />}
      middleContent={
        <div className="home">
          <div className="home-examCard">
            {/* Neutral, as on 01: Knowie and a headline rather than a result.
                The caption stays on here — it is what says a term is due. */}
            <VerdictHeader
              verdict="Neutral"
              titleAs="h1"
              title="Your History exam is in 5 days"
              caption="1 term to revisit"
            />

            <div className="home-actions">
              {/* A revisit session, not the first run: SPEC.md sends this
                  straight to the first term rather than through the primer. */}
              <Button
                variant="Primary"
                size="M"
                CTA="Explain out loud"
                showLeftIcon
                leftIcon="microphone-01"
                href="/explain/1"
              />
              <Button
                variant="Tertiary"
                size="S"
                CTA="Continue studying"
                showRightIcon
                rightIcon="arrow-right"
                href="/plan"
              />
            </div>
          </div>
        </div>
      }
      bottomContent={<ChromeStrip src="/chrome/home-bottom.png" height={185} />}
    />
  );
}
