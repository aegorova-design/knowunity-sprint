/**
 * 06 Idle — `/explain/[term]`. The term prompt, and the mic waiting to be
 * started. One state, per SPEC.md screen 18.
 *
 * Matches the Mockups v2 frame "06 Idle" (13662:14533).
 *
 * Skip is live here — the student can still act on this term — and the
 * progress indicator has not moved for this term yet, per SPEC.md's Skip and
 * Progress rules.
 */

import { notFound } from 'next/navigation';

import { Button } from '@/components/button/Button';
import { MascotFigure } from '@/components/mascot-figure/MascotFigure';
import { Scaffold } from '@/components/scaffold/Scaffold';
import { TextBlock } from '@/components/text-block/TextBlock';

import { TERMS, TERM_PROMPT_CAPTION, isTermPosition, nextTermHref } from '../session';
import { SessionAppBar } from './SessionAppBar';
import { StartRecordingButton } from './navigation';

import './idleScreen.css';

export default async function IdlePage({ params }: { params: Promise<{ term: string }> }) {
  const { term } = await params;
  if (!isTermPosition(term)) notFound();

  const current = TERMS[term];

  return (
    <Scaffold
      size="iPhone 13"
      topNavigation={<SessionAppBar term={term} skipHref={nextTermHref(term)} />}
      middleContent={
        <div className="idleScreen-prompt">
          <MascotFigure size="S" pose="Standby" />
          <TextBlock
            variant="M"
            title={current.prompt}
            caption={TERM_PROMPT_CAPTION}
            showCaption
            titleAs="h1"
          />
        </div>
      }
      bottomContent={
        <div className="idleScreen-bottom">
          <div className="idleScreen-micZone">
            <StartRecordingButton href={`/explain/${term}/recording`} label="Start recording" />
            {/* The record button's visible label and helper. Not a Storybook
                component — recordButton's own `label` is its accessible name,
                and this copy is the page's. Logged in component-gaps.md. */}
            <div className="idleScreen-micCopy">
              <p className="idleScreen-micLabel">Tap to start</p>
              <p className="idleScreen-micHelper">About 30 seconds is plenty</p>
            </div>
          </div>

          <div className="idleScreen-actions">
            {/* SPEC.md leaves where "I don't know" lives open; this frame
                answers it by putting it here. What it does is settled — one
                hint, then the reveal — and that hint is its own neutral
                screen, not `hint-1`: the ladder's first rung carries a Miss
                verdict and quotes back what Knowie heard, and a student who
                has not spoken yet has neither. */}
            <Button
              variant="Secondary"
              size="M"
              CTA="I don’t know"
              showLeftIcon
              leftIcon="help-circle"
              href={`/explain/${term}/hint`}
            />
            <Button
              variant="Secondary"
              size="M"
              CTA="Type instead"
              showLeftIcon
              leftIcon="keyboard-01"
              href={`/explain/${term}/type`}
            />
          </div>
        </div>
      }
    />
  );
}
